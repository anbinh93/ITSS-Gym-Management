import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ChevronLeft, ChevronRight, Edit2, Save, X, Plus, Users, User, Search, CheckCircle2, XCircle, Award, Copy, CalendarDays } from 'lucide-react';
import './Schedule.css';
import { getMembershipsByCoach } from '../../services/membershipApi';
import { getUserWorkoutSchedule, createUserWorkoutSchedule } from '../../services/api';
import { createWorkoutSession, confirmWorkoutSession, getUserWorkoutSessions, checkOutWorkoutSession } from '../../services/workoutSessionApi';
import authService from '../../services/authService';

function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

const ScheduleCalendar = () => {
    const [value, setValue] = useState(new Date());
    const [activeStartDate, setActiveStartDate] = useState(new Date());
    const [trainees, setTrainees] = useState([]);
    const [workouts, setWorkouts] = useState({});
    const [workoutSessions, setWorkoutSessions] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempWorkout, setTempWorkout] = useState({ 
        title: '', 
        description: '', 
        startTime: '08:00',
        endTime: '09:00',
        createSession: false 
    });
    const [selectedTraineeId, setSelectedTraineeId] = useState(null); // null means "All trainees"
    const [loadingTrainees, setLoadingTrainees] = useState(true);
    const [errorTrainees, setErrorTrainees] = useState("");
    const [loadingSessions, setLoadingSessions] = useState(false);
    
    // States for repeat schedule functionality
    const [showRepeatModal, setShowRepeatModal] = useState(false);
    const [selectedWorkoutToRepeat, setSelectedWorkoutToRepeat] = useState(null);
    const [selectedDatesToRepeat, setSelectedDatesToRepeat] = useState([]);
    const [repeatSaving, setRepeatSaving] = useState(false);
    
    // States for feedback functionality
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackSessionId, setFeedbackSessionId] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [showQuickOptions, setShowQuickOptions] = useState(false);

    useEffect(() => {
        const fetchTrainees = async () => {
            setLoadingTrainees(true);
            setErrorTrainees("");
            try {
                const coach = authService.getCurrentUser();
                if (!coach || !coach._id) {
                    setErrorTrainees("Không tìm thấy thông tin HLV");
                    setTrainees([]);
                    setLoadingTrainees(false);
                    return;
                }
                const res = await getMembershipsByCoach(coach._id);
                if (res.success) {
                    // Get unique users with their active membership info
                    const users = [];
                    const userIds = new Set();
                    (res.data || []).forEach(m => {
                        if (m.user && m.user._id && !userIds.has(m.user._id) && m.isActive) {
                            users.push({ 
                                id: m.user._id, 
                                name: m.user.name,
                                membershipId: m._id,
                                sessionsRemaining: m.sessionsRemaining
                            });
                            userIds.add(m.user._id);
                        }
                    });
                    setTrainees(users);
                } else {
                    setErrorTrainees(res.message || "Không thể tải danh sách học viên");
                    setTrainees([]);
                }
            } catch (err) {
                setErrorTrainees("Lỗi kết nối API");
                setTrainees([]);
            } finally {
                setLoadingTrainees(false);
            }
        };
        fetchTrainees();
    }, []);

    // Đảm bảo luôn fetch lịch tập khi chọn học viên, kể cả khi chọn lại cùng một học viên
    const fetchScheduleForTrainee = async (traineeId) => {
        if (!traineeId) return;
        try {
            // Fetch schedule data
            const res = await getUserWorkoutSchedule(traineeId);
            if (res.success) {
                const scheduleMap = {};
                scheduleMap[traineeId] = {};
                (res.schedules || []).forEach(sch => {
                    (sch.schedule || []).forEach(item => {
                        if (item.time && item.time.match(/^\d{4}-\d{2}-\d{2}/)) {
                            scheduleMap[traineeId][item.time] = {
                                title: item.exercises?.join(', ') || '',
                                description: sch.note || ''
                            };
                        }
                    });
                });
                setWorkouts(prev => ({ ...prev, ...scheduleMap }));
            }

            // Fetch workout sessions
            const sessionsRes = await getUserWorkoutSessions(traineeId, 1, 100);
            if (sessionsRes.success) {
                const sessionsMap = {};
                sessionsMap[traineeId] = sessionsRes.workoutSessions || [];
                setWorkoutSessions(prev => ({ ...prev, ...sessionsMap }));
            }
        } catch (err) {
            console.error('API error:', err);
        }
    };

    const handleMonthChange = (direction) => {
        const newDate = new Date(activeStartDate);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setActiveStartDate(newDate);
    };

    const handleDateClick = (date) => {
        setValue(date);
        setSelectedDate(date);
        const dateKey = formatDateKey(date);

        // If specific trainee is selected, load their workout
        if (selectedTraineeId && workouts[selectedTraineeId] && workouts[selectedTraineeId][dateKey]) {
            setTempWorkout({ ...workouts[selectedTraineeId][dateKey] });
        } else {
            setTempWorkout({ title: '', description: '' });
        }
        setIsEditing(false);
    };

    // Session management functions
    const getSessionsForDate = (date) => {
        if (!selectedTraineeId || !workoutSessions[selectedTraineeId]) return [];
        
        const dateKey = formatDateKey(date);
        return workoutSessions[selectedTraineeId].filter(session => {
            const sessionDate = new Date(session.workoutDate).toISOString().split('T')[0];
            return sessionDate === dateKey;
        });
    };

    const handleConfirmSession = async (sessionId) => {
        try {
            setLoadingSessions(true);
            await confirmWorkoutSession(sessionId, { confirmed: true });
            
            // Refresh sessions
            if (selectedTraineeId) {
                await fetchScheduleForTrainee(selectedTraineeId);
            }
            
            alert('Đã xác nhận buổi tập thành công!');
        } catch (err) {
            alert('Lỗi khi xác nhận buổi tập: ' + (err.message || 'Unknown error'));
        } finally {
            setLoadingSessions(false);
        }
    };

    const handleCheckOutSession = async (sessionId, notes = '') => {
        try {
            setLoadingSessions(true);
            await checkOutWorkoutSession(sessionId, notes);
            
            // Refresh sessions
            if (selectedTraineeId) {
                await fetchScheduleForTrainee(selectedTraineeId);
            }
            
            alert('Đã hoàn thành buổi tập thành công!');
        } catch (err) {
            alert('Lỗi khi hoàn thành buổi tập: ' + (err.message || 'Unknown error'));
        } finally {
            setLoadingSessions(false);
        }
    };

    // Handle feedback modal for checkout
    const handleOpenFeedbackModal = (sessionId) => {
        setFeedbackSessionId(sessionId);
        setFeedbackText('');
        setShowFeedbackModal(true);
        setShowQuickOptions(false);
    };

    const handleCloseFeedbackModal = () => {
        setShowFeedbackModal(false);
        setFeedbackSessionId(null);
        setFeedbackText('');
        setShowQuickOptions(false);
    };

    const handleQuickFeedback = async (sessionId, quickFeedback) => {
        try {
            setLoadingSessions(true);
            await checkOutWorkoutSession(sessionId, quickFeedback);
            
            // Refresh sessions
            if (selectedTraineeId) {
                await fetchScheduleForTrainee(selectedTraineeId);
            }
            
            alert('Đã hoàn thành buổi tập và gửi phản hồi thành công!');
        } catch (err) {
            alert('Lỗi khi hoàn thành buổi tập: ' + (err.message || 'Unknown error'));
        } finally {
            setLoadingSessions(false);
        }
    };

    const handleSubmitFeedback = async () => {
        if (!feedbackSessionId) return;
        
        try {
            setLoadingSessions(true);
            await checkOutWorkoutSession(feedbackSessionId, feedbackText);
            
            // Refresh sessions
            if (selectedTraineeId) {
                await fetchScheduleForTrainee(selectedTraineeId);
            }
            
            alert('Đã hoàn thành buổi tập và gửi phản hồi thành công!');
            handleCloseFeedbackModal();
        } catch (err) {
            alert('Lỗi khi hoàn thành buổi tập: ' + (err.message || 'Unknown error'));
        } finally {
            setLoadingSessions(false);
        }
    };

    const handleAddWorkout = () => {
        if (!selectedTraineeId) {
            alert('Vui lòng chọn học viên trước khi thêm lịch tập.');
            return;
        }
        setIsEditing(true);
    };

    const handleEditWorkout = () => {
        if (!selectedTraineeId) {
            alert('Vui lòng chọn học viên trước khi chỉnh sửa lịch tập.');
            return;
        }
        setIsEditing(true);
    };

    const handleSaveWorkout = async () => {
        if (!selectedDate || !selectedTraineeId) return;
        
        const dateKey = formatDateKey(selectedDate);
        const updatedWorkouts = { ...workouts };
        
        if (!updatedWorkouts[selectedTraineeId]) {
            updatedWorkouts[selectedTraineeId] = {};
        }
        
        if (tempWorkout.title.trim() === '') {
            if (updatedWorkouts[selectedTraineeId][dateKey]) {
                delete updatedWorkouts[selectedTraineeId][dateKey];
            }
        } else {
            updatedWorkouts[selectedTraineeId][dateKey] = { ...tempWorkout };
        }
        
        setWorkouts(updatedWorkouts);
        setIsEditing(false);
        
        try {
            // Save schedule entry
            await createUserWorkoutSchedule(selectedTraineeId, {
                schedule: [{
                    dayOfWeek: selectedDate.toLocaleDateString('en-US', { weekday: 'long' }),
                    exercises: tempWorkout.title.split(',').map(s => s.trim()),
                    time: dateKey
                }],
                note: tempWorkout.description
            });
            
            // Create workout session if requested
            if (tempWorkout.createSession) {
                // Find the user's active membership
                const trainee = trainees.find(t => t.id === selectedTraineeId);
                if (trainee && trainee.membershipId) {
                    const coach = authService.getCurrentUser();
                    await createWorkoutSession({
                        membershipId: trainee.membershipId,
                        workoutDate: dateKey,
                        startTime: tempWorkout.startTime,
                        endTime: tempWorkout.endTime,
                        exerciseName: tempWorkout.title,
                        notes: tempWorkout.description,
                        coachId: coach._id
                    });
                }
            }
            
        } catch (err) {
            console.error('Error saving workout:', err);
            alert('Có lỗi khi lưu lịch tập: ' + (err.message || 'Unknown error'));
        }
    };

    const handleCancelEdit = () => {
        if (selectedTraineeId && selectedDate) {
            const dateKey = formatDateKey(selectedDate);
            if (workouts[selectedTraineeId] && workouts[selectedTraineeId][dateKey]) {
                setTempWorkout({ ...workouts[selectedTraineeId][dateKey] });
            } else {
                setTempWorkout({ title: '', description: '' });
            }
        }
        setIsEditing(false);
    };

    const formatDate = (date) => {
        if (!date) return '';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('vi-VN', options);
    };

    // Sửa lại handleTraineeSelect để luôn gọi API
    const handleTraineeSelect = (traineeId) => {
        setSelectedTraineeId(traineeId);
        fetchScheduleForTrainee(traineeId); // Luôn gọi API khi chọn
        // Reset workout detail when changing trainee
        if (selectedDate) {
            const dateKey = formatDateKey(selectedDate);
            if (traineeId && workouts[traineeId] && workouts[traineeId][dateKey]) {
                setTempWorkout({ ...workouts[traineeId][dateKey] });
            } else {
                setTempWorkout({ title: '', description: '' });
            }
        }
    };

    // Get workouts for the selected date across all trainees
    const getWorkoutsForDate = (date) => {
        const dateKey = formatDateKey(date);
        const workoutsForDate = [];

        if (selectedTraineeId) {
            // Single trainee view
            if (workouts[selectedTraineeId] && workouts[selectedTraineeId][dateKey]) {
                return [{
                    traineeId: selectedTraineeId,
                    traineeName: trainees.find(t => t.id === selectedTraineeId)?.name,
                    ...workouts[selectedTraineeId][dateKey]
                }];
            }
        } else {
            // All trainees view
            Object.keys(workouts).forEach(traineeId => {
                if (workouts[traineeId][dateKey]) {
                    const trainee = trainees.find(t => t.id === parseInt(traineeId));
                    workoutsForDate.push({
                        traineeId: parseInt(traineeId),
                        traineeName: trainee?.name,
                        ...workouts[traineeId][dateKey]
                    });
                }
            });
        }

        return workoutsForDate;
    };

    // Check if a date has workouts (for calendar indicator)
    const hasWorkoutOnDate = (date) => {
        const dateKey = formatDateKey(date);

        if (selectedTraineeId) {
            // Check for specific trainee
            return workouts[selectedTraineeId] && workouts[selectedTraineeId][dateKey];
        } else {
            // Check for any trainee
            return Object.keys(workouts).some(traineeId =>
                workouts[traineeId][dateKey]
            );
        }
    };

    // Get selected trainee name
    const getSelectedTraineeName = () => {
        if (!selectedTraineeId) return "Tất cả học viên";
        const trainee = trainees.find(t => t.id === selectedTraineeId);
        return trainee ? trainee.name : "Học viên không xác định";
    };

    // Search filter for trainees
    const [searchQuery, setSearchQuery] = useState('');

    // Filter trainees based on search query
    const filteredTrainees = trainees.filter(trainee =>
        trainee.name && trainee.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Repeat schedule functions
    const handleRepeatSchedule = (workout) => {
        setSelectedWorkoutToRepeat(workout);
        setSelectedDatesToRepeat([]);
        setShowRepeatModal(true);
    };

    const handleDateToggleForRepeat = (date) => {
        const dateKey = formatDateKey(date);
        const currentDateKey = formatDateKey(selectedDate);
        
        // Don't allow selecting the current date
        if (dateKey === currentDateKey) return;
        
        setSelectedDatesToRepeat(prev => {
            if (prev.includes(dateKey)) {
                return prev.filter(d => d !== dateKey);
            } else {
                return [...prev, dateKey];
            }
        });
    };

    const handleSaveRepeatedSchedule = async () => {
        if (!selectedWorkoutToRepeat || !selectedTraineeId || selectedDatesToRepeat.length === 0) {
            alert('Vui lòng chọn ít nhất một ngày để lặp lại lịch tập.');
            return;
        }

        // Confirm action
        const confirmMessage = `Bạn có chắc chắn muốn lặp lại lịch tập "${selectedWorkoutToRepeat.title}" cho ${selectedDatesToRepeat.length} ngày đã chọn?\n\nLưu ý: Những ngày đã có lịch tập sẽ bị ghi đè.`;
        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setRepeatSaving(true);
            
            // Save schedule for each selected date
            for (const dateKey of selectedDatesToRepeat) {
                await createUserWorkoutSchedule(selectedTraineeId, {
                    schedule: [{
                        dayOfWeek: new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long' }),
                        exercises: selectedWorkoutToRepeat.title.split(',').map(s => s.trim()),
                        time: dateKey,
                        startTime: selectedWorkoutToRepeat.startTime || '08:00',
                        endTime: selectedWorkoutToRepeat.endTime || '09:00'
                    }],
                    note: selectedWorkoutToRepeat.description
                });

                // Create workout session if the original had createSession enabled
                if (selectedWorkoutToRepeat.createSession) {
                    const trainee = trainees.find(t => t.id === selectedTraineeId);
                    if (trainee && trainee.membershipId) {
                        const coach = authService.getCurrentUser();
                        await createWorkoutSession({
                            membershipId: trainee.membershipId,
                            workoutDate: dateKey,
                            startTime: selectedWorkoutToRepeat.startTime || '08:00',
                            endTime: selectedWorkoutToRepeat.endTime || '09:00',
                            exerciseName: selectedWorkoutToRepeat.title,
                            notes: selectedWorkoutToRepeat.description,
                            coachId: coach._id
                        });
                    }
                }
            }

            // Refresh data
            await fetchScheduleForTrainee(selectedTraineeId);
            
            alert(`✅ Đã lặp lại lịch tập cho ${selectedDatesToRepeat.length} ngày thành công!`);
            setShowRepeatModal(false);
            setSelectedWorkoutToRepeat(null);
            setSelectedDatesToRepeat([]);
            
        } catch (err) {
            console.error('Error repeating schedule:', err);
            alert('❌ Có lỗi khi lặp lại lịch tập: ' + (err.message || 'Unknown error'));
        } finally {
            setRepeatSaving(false);
        }
    };

    // Generate calendar days for the repeat modal (next 30 days)
    const getRepeatCalendarDays = () => {
        const days = [];
        const startDate = new Date();
        
        for (let i = 1; i <= 30; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            days.push(date);
        }
        
        return days;
    };

    if (loadingTrainees) return <div className="text-center">Đang tải danh sách học viên...</div>;
    if (errorTrainees) return <div className="alert alert-danger">{errorTrainees}</div>;

    return (
        <div className="container py-5">
            {/* Trainee Selector Section */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-lg rounded-3">
                        
                        <div className="card-body p-4">
                            <div className="row">
                                <div className="col-md-6 mb-3 mb-md-0">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0">
                                            <Search size={18} />
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control border-0 bg-light"
                                            placeholder="Tìm kiếm học viên..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex flex-wrap gap-2">
                                        <button
                                            className={`btn ${!selectedTraineeId ? 'btn-primary' : 'btn-outline-primary'} d-flex align-items-center gap-1`}
                                            onClick={() => handleTraineeSelect(null)}
                                        >
                                            <Users size={18} />
                                            <span>Tất cả học viên</span>
                                        </button>

                                        {selectedTraineeId && (
                                            <div className="d-flex align-items-center ms-3">
                                                <User size={18} className="text-primary me-2" />
                                                <span className="fw-bold">Đang chọn: {getSelectedTraineeName()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3">
                                    {filteredTrainees.map(trainee => (
                                        <div key={trainee.id} className="col">
                                            <button
                                                className={`btn ${selectedTraineeId === trainee.id ? 'btn-primary' : 'btn-outline-secondary'} w-100 d-flex align-items-center gap-2 justify-content-center py-2`}
                                                onClick={() => handleTraineeSelect(trainee.id)}
                                            >
                                                <User size={16} />
                                                <span>{trainee.name}</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12 col-lg-6 mb-4 mb-lg-0">
                    <div className="position-relative">
                        {/* Calendar Card */}
                        <div className="card border-0 shadow-lg rounded-3 overflow-hidden">
                            {/* Card Header */}
                            <div className="card-header bg-primary bg-gradient text-white py-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h4 className="mb-0 fw-bold">Lịch Tập Luyện</h4>

                                    {selectedTraineeId ? (
                                        <div className="d-flex align-items-center">
                                            <User size={16} className="me-2" />
                                            <span>{getSelectedTraineeName()}</span>
                                        </div>
                                    ) : (
                                        <div className="d-flex align-items-center">
                                            <Users size={16} className="me-2" />
                                            <span>Tất cả học viên</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="card-body p-4">
                                <div className="position-relative">
                                    {/* Left Arrow */}
                                    <button
                                        onClick={() => handleMonthChange('prev')}
                                        className="btn btn-sm btn-outline-primary rounded-circle position-absolute top-50 start-0 translate-middle-y d-flex justify-content-center align-items-center"
                                        style={{ width: '36px', height: '36px', zIndex: 2 }}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    {/* Calendar */}
                                    <div className="calendar-container mx-5">
                                        <Calendar
                                            onChange={handleDateClick}
                                            value={value}
                                            activeStartDate={activeStartDate}
                                            onActiveStartDateChange={({ activeStartDate }) => {
                                                if (activeStartDate) setActiveStartDate(activeStartDate);
                                            }}
                                            tileContent={({ date, view }) => {
                                                if (view !== 'month') return null;

                                                // Check if there are workouts on this date
                                                if (hasWorkoutOnDate(date)) {
                                                    return (
                                                        <div className="workout-indicator text-primary">
                                                            {selectedTraineeId
                                                                ? workouts[selectedTraineeId][formatDateKey(date)]?.title
                                                                : "Có lịch tập"}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </div>

                                    {/* Right Arrow */}
                                    <button
                                        onClick={() => handleMonthChange('next')}
                                        className="btn btn-sm btn-outline-primary rounded-circle position-absolute top-50 end-0 translate-middle-y d-flex justify-content-center align-items-center"
                                        style={{ width: '36px', height: '36px', zIndex: 2 }}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="card-footer bg-light p-3">
                                <div className="d-flex align-items-center">
                                    <div className="rounded-circle bg-primary" style={{ width: '12px', height: '12px' }}></div>
                                    <span className="ms-2 small text-muted">Ngày có lịch tập</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detail Panel */}
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-lg rounded-3 h-100">
                        <div className="card-header bg-primary bg-gradient text-white py-3">
                            <h4 className="mb-0 fw-bold">
                                {selectedDate ? formatDate(selectedDate) : 'Chi tiết lịch tập'}
                            </h4>
                        </div>

                        <div className="card-body p-4">
                            {selectedDate ? (
                                <>
                                    {isEditing && selectedTraineeId ? (
                                        <div className="workout-edit">
                                            <div className="mb-3">
                                                <label htmlFor="workoutTitle" className="form-label fw-bold">Tiêu đề</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="workoutTitle"
                                                    placeholder="Nhập tiêu đề lịch tập"
                                                    value={tempWorkout.title}
                                                    onChange={(e) => setTempWorkout({ ...tempWorkout, title: e.target.value })}
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label htmlFor="workoutDescription" className="form-label fw-bold">Chi tiết bài tập</label>
                                                <textarea
                                                    className="form-control"
                                                    id="workoutDescription"
                                                    rows="6"
                                                    placeholder="Nhập chi tiết bài tập (mỗi bài tập một dòng)"
                                                    value={tempWorkout.description}
                                                    onChange={(e) => setTempWorkout({ ...tempWorkout, description: e.target.value })}
                                                ></textarea>
                                            </div>

                                            <div className="mb-3">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="createSession"
                                                        checked={tempWorkout.createSession}
                                                        onChange={(e) => setTempWorkout({ ...tempWorkout, createSession: e.target.checked })}
                                                    />
                                                    <label className="form-check-label fw-bold" htmlFor="createSession">
                                                        Tạo buổi tập theo dõi tiến độ
                                                    </label>
                                                </div>
                                            </div>

                                            {tempWorkout.createSession && (
                                                <div className="row mb-3">
                                                    <div className="col-md-6">
                                                        <label htmlFor="startTime" className="form-label fw-bold">Thời gian bắt đầu</label>
                                                        <input
                                                            type="time"
                                                            className="form-control"
                                                            id="startTime"
                                                            value={tempWorkout.startTime}
                                                            onChange={(e) => setTempWorkout({ ...tempWorkout, startTime: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label htmlFor="endTime" className="form-label fw-bold">Thời gian kết thúc</label>
                                                        <input
                                                            type="time"
                                                            className="form-control"
                                                            id="endTime"
                                                            value={tempWorkout.endTime}
                                                            onChange={(e) => setTempWorkout({ ...tempWorkout, endTime: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="d-flex gap-2 justify-content-end">
                                                <button
                                                    className="btn btn-outline-secondary d-flex align-items-center gap-1"
                                                    onClick={handleCancelEdit}
                                                >
                                                    <X size={16} />
                                                    Hủy
                                                </button>
                                                <button
                                                    className="btn btn-primary d-flex align-items-center gap-1"
                                                    onClick={handleSaveWorkout}
                                                >
                                                    <Save size={16} />
                                                    Lưu
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="workout-details">
                                            {/* Show schedules for the selected date */}
                                            {getWorkoutsForDate(selectedDate).length > 0 && (
                                                <div className="mb-4">
                                                    <h6 className="text-primary fw-bold mb-3">
                                                        <Calendar size={16} className="me-2" />
                                                        Lịch tập được xếp
                                                    </h6>
                                                    {getWorkoutsForDate(selectedDate).map((workout, index) => (
                                                        <div key={index} className="workout-item mb-3">
                                                            {!selectedTraineeId && (
                                                                <div className="d-flex align-items-center mb-2">
                                                                    <User size={16} className="text-primary me-2" />
                                                                    <span className="fw-bold">{workout.traineeName}</span>
                                                                </div>
                                                            )}                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h6 className="fw-bold text-primary mb-0">{workout.title}</h6>
                                                {selectedTraineeId && (
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                                                            onClick={() => handleRepeatSchedule(workout)}
                                                            title="Lặp lại lịch tập này sang các ngày khác"
                                                        >
                                                            <Copy size={16} />
                                                            Lặp lại
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                                            onClick={handleEditWorkout}
                                                        >
                                                            <Edit2 size={16} />
                                                            Chỉnh sửa
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                                            <div className="workout-description">
                                                                <pre className="mb-0" style={{
                                                                    whiteSpace: 'pre-wrap',
                                                                    fontFamily: 'inherit',
                                                                    backgroundColor: 'transparent',
                                                                    border: 'none',
                                                                    padding: 0
                                                                }}>
                                                                    {workout.description || <em>Không có mô tả chi tiết</em>}
                                                                </pre>
                                                            </div>

                                                            {index < getWorkoutsForDate(selectedDate).length - 1 && (
                                                                <hr className="my-2" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Show workout sessions for the selected date */}
                                            {selectedTraineeId && getSessionsForDate(selectedDate).length > 0 && (
                                                <div className="mb-4">
                                                    <h6 className="text-success fw-bold mb-3">
                                                        <Award size={16} className="me-2" />
                                                        Buổi tập đã tạo ({getSessionsForDate(selectedDate).length})
                                                    </h6>
                                                    {getSessionsForDate(selectedDate).map((session, index) => (
                                                        <div key={index} className="session-item mb-3 p-3 border rounded">
                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                <h6 className="fw-bold text-success mb-0">{session.exerciseName}</h6>
                                                                <div className="d-flex align-items-center gap-2">                                                    <span className="badge bg-info">
                                                        {session.startTime} - {session.endTime}
                                                    </span>
                                                    {session.status === 'completed' ? (
                                                        <span className="badge bg-success">
                                                            <CheckCircle2 size={14} className="me-1" />
                                                            Đã hoàn thành
                                                        </span>
                                                    ) : session.status === 'checked_in' ? (
                                                        <span className="badge bg-primary">
                                                            <User size={14} className="me-1" />
                                                            Đã check-in
                                                        </span>
                                                    ) : session.isConfirmed ? (
                                                        <span className="badge bg-success">
                                                            <CheckCircle2 size={14} className="me-1" />
                                                            Đã xác nhận
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-warning">
                                                            <XCircle size={14} className="me-1" />
                                                            Chờ xác nhận
                                                        </span>
                                                    )}
                                                                </div>
                                                            </div>

                                                            {session.notes && session.status === 'completed' && (
                                                                <div className="alert alert-success border-success bg-success bg-opacity-10 mb-2 py-2">
                                                                    <div className="d-flex align-items-start">
                                                                        <div className="text-success me-2 mt-1">
                                                                            <Award size={14} />
                                                                        </div>
                                                                        <div className="flex-grow-1">
                                                                            <h6 className="alert-heading fs-6 mb-1 text-success">
                                                                                Phản hồi đã gửi
                                                                            </h6>
                                                                            <p className="mb-0 small" style={{whiteSpace: 'pre-wrap'}}>
                                                                                {session.notes}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {session.notes && session.status !== 'completed' && (
                                                                <div className="mb-2">
                                                                    <small className="text-muted">
                                                                        <strong>Ghi chú:</strong> {session.notes}
                                                                    </small>
                                                                </div>
                                                            )}                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">
                                                    Tạo lúc: {new Date(session.createdAt).toLocaleString('vi-VN')}
                                                    {session.checkedInAt && (
                                                        <span className="d-block">
                                                            Check-in: {new Date(session.checkedInAt).toLocaleString('vi-VN')}
                                                        </span>
                                                    )}
                                                    {session.checkedOutAt && (
                                                        <span className="d-block">
                                                            Hoàn thành: {new Date(session.checkedOutAt).toLocaleString('vi-VN')}
                                                        </span>
                                                    )}
                                                </small>
                                                <div className="d-flex gap-2">
                                                    {session.status === 'checked_in' && (
                                                        <div className="btn-group">
                                                            <button
                                                                className="btn btn-sm btn-success"
                                                                onClick={() => handleOpenFeedbackModal(session._id)}
                                                                disabled={loadingSessions}
                                                            >
                                                                <CheckCircle2 size={14} className="me-1" />
                                                                {loadingSessions ? 'Đang xử lý...' : 'Hoàn thành'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-success dropdown-toggle dropdown-toggle-split"
                                                                data-bs-toggle="dropdown"
                                                                aria-expanded="false"
                                                                disabled={loadingSessions}
                                                            >
                                                                <span className="visually-hidden">Toggle Dropdown</span>
                                                            </button>
                                                            <ul className="dropdown-menu">
                                                                <li><h6 className="dropdown-header">Phản hồi nhanh</h6></li>
                                                                <li>
                                                                    <button 
                                                                        className="dropdown-item" 
                                                                        onClick={() => handleQuickFeedback(session._id, "Buổi tập thực hiện tốt! Học viên đã hoàn thành đầy đủ các bài tập theo yêu cầu.")}
                                                                        disabled={loadingSessions}
                                                                    >
                                                                        👍 Hoàn thành tốt
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button 
                                                                        className="dropdown-item" 
                                                                        onClick={() => handleQuickFeedback(session._id, "Buổi tập thực hiện xuất sắc! Học viên cho thấy sự tiến bộ rõ rệt và tinh thần luyện tập tích cực.")}
                                                                        disabled={loadingSessions}
                                                                    >
                                                                        ⭐ Xuất sắc
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button 
                                                                        className="dropdown-item" 
                                                                        onClick={() => handleQuickFeedback(session._id, "Buổi tập cần cải thiện thêm. Học viên nên chú ý đến form và kỹ thuật thực hiện bài tập.")}
                                                                        disabled={loadingSessions}
                                                                    >
                                                                        📝 Cần cải thiện
                                                                    </button>
                                                                </li>
                                                                <li><hr className="dropdown-divider" /></li>
                                                                <li>
                                                                    <button 
                                                                        className="dropdown-item" 
                                                                        onClick={() => handleOpenFeedbackModal(session._id)}
                                                                        disabled={loadingSessions}
                                                                    >
                                                                        ✏️ Viết phản hồi chi tiết
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {!session.isConfirmed && session.status === 'scheduled' && (
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleConfirmSession(session._id)}
                                                            disabled={loadingSessions}
                                                        >
                                                            <CheckCircle2 size={14} className="me-1" />
                                                            {loadingSessions ? 'Đang xử lý...' : 'Xác nhận'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* No schedule or sessions message */}
                                            {getWorkoutsForDate(selectedDate).length === 0 && 
                                             (!selectedTraineeId || getSessionsForDate(selectedDate).length === 0) && (
                                                <div className="text-center py-5">
                                                    <div className="mb-3 text-muted">
                                                        {selectedTraineeId
                                                            ? "Chưa có lịch tập cho ngày này"
                                                            : "Không có học viên nào có lịch tập vào ngày này"}
                                                    </div>

                                                    {selectedTraineeId && (
                                                        <button
                                                            className="btn btn-primary d-inline-flex align-items-center gap-1"
                                                            onClick={handleAddWorkout}
                                                        >
                                                            <Plus size={18} />
                                                            Thêm lịch tập
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    <p>Vui lòng chọn một ngày để xem hoặc chỉnh sửa lịch tập</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Repeat Schedule Modal */}
            {showRepeatModal && (
                <div className="modal fade show repeat-modal-backdrop" tabIndex="-1" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title d-flex align-items-center">
                                    <CalendarDays size={20} className="me-2" />
                                    Lặp Lại Lịch Tập
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRepeatModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {/* Workout Preview */}
                                <div className="repeat-workout-preview">
                                    <div className="repeat-workout-title">
                                        📋 {selectedWorkoutToRepeat?.title}
                                    </div>
                                    {selectedWorkoutToRepeat?.description && (
                                        <div className="repeat-workout-description">
                                            {selectedWorkoutToRepeat.description}
                                        </div>
                                    )}
                                    <div className="mt-2">
                                        <small className="text-muted">
                                            ⏰ {selectedWorkoutToRepeat?.startTime || '08:00'} - {selectedWorkoutToRepeat?.endTime || '09:00'}
                                        </small>
                                    </div>
                                </div>

                                <div className="alert alert-info">
                                    <strong>💡 Lưu ý:</strong> Chọn những ngày bạn muốn lặp lại lịch tập này. Hệ thống sẽ tự động tạo lịch mới cho từng ngày được chọn.
                                </div>

                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <label className="form-label fw-bold mb-0">
                                            📅 Chọn ngày lặp lại (30 ngày tới)
                                        </label>
                                        <div className="btn-group btn-group-sm">
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => {
                                                    const availableDates = getRepeatCalendarDays()
                                                        .map(date => formatDateKey(date))
                                                        .filter(dateKey => {
                                                            const currentDateKey = formatDateKey(selectedDate);
                                                            return dateKey !== currentDateKey;
                                                        });
                                                    setSelectedDatesToRepeat(availableDates);
                                                }}
                                            >
                                                Chọn tất cả
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => setSelectedDatesToRepeat([])}
                                            >
                                                Bỏ chọn tất cả
                                            </button>
                                        </div>
                                    </div>
                                    <div className="repeat-calendar-grid">
                                        <div className="row g-2">
                                            {getRepeatCalendarDays().map((date, i) => {
                                                const dateKey = formatDateKey(date);
                                                const currentDateKey = formatDateKey(selectedDate);
                                                const isCurrentDate = dateKey === currentDateKey;
                                                const hasExistingWorkout = selectedTraineeId && workouts[selectedTraineeId] && workouts[selectedTraineeId][dateKey];
                                                const isSelected = selectedDatesToRepeat.includes(dateKey);
                                                
                                                return (
                                                    <div key={i} className="col-lg-4 col-md-6">
                                                        <div 
                                                            className={`repeat-date-option form-check ${
                                                                isCurrentDate ? 'disabled' : ''
                                                            } ${hasExistingWorkout ? 'has-conflict' : ''} ${
                                                                isSelected ? 'selected' : ''
                                                            }`}
                                                        >
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`repeatDate${i}`}
                                                                checked={isSelected}
                                                                disabled={isCurrentDate}
                                                                onChange={(e) => handleDateToggleForRepeat(date)}
                                                            />
                                                            <label 
                                                                className="form-check-label w-100" 
                                                                htmlFor={`repeatDate${i}`}
                                                                style={{ cursor: isCurrentDate ? 'not-allowed' : 'pointer' }}
                                                            >
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <span>
                                                                        {date.toLocaleDateString('vi-VN', { 
                                                                            weekday: 'short', 
                                                                            day: 'numeric', 
                                                                            month: 'numeric' 
                                                                        })}
                                                                    </span>
                                                                    <div>
                                                                        {isCurrentDate && <span className="badge bg-secondary">Hiện tại</span>}
                                                                        {hasExistingWorkout && !isCurrentDate && <span className="badge bg-warning">Có lịch</span>}
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    
                                    {selectedDatesToRepeat.length > 0 && (
                                        <div className="mt-3 alert alert-success">
                                            <strong>✅ Đã chọn {selectedDatesToRepeat.length} ngày</strong> để lặp lại lịch tập
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-outline-secondary" 
                                    onClick={() => setShowRepeatModal(false)}
                                >
                                    <X size={16} className="me-1" />
                                    Hủy
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    onClick={handleSaveRepeatedSchedule} 
                                    disabled={repeatSaving || selectedDatesToRepeat.length === 0}
                                >
                                    {repeatSaving ? (
                                        <>
                                            <div className="spinner-border spinner-border-sm me-2" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} className="me-1" />
                                            Lưu lịch lặp lại ({selectedDatesToRepeat.length})
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title d-flex align-items-center">
                                    <CheckCircle2 size={20} className="me-2" />
                                    Hoàn thành buổi tập và đánh giá
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white" 
                                    onClick={handleCloseFeedbackModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-info">
                                    <strong>💡 Hướng dẫn:</strong> Hãy để lại phản hồi và đánh giá cho học viên về buổi tập này. 
                                    Phản hồi sẽ giúp học viên hiểu rõ hơn về tiến bộ và những điểm cần cải thiện.
                                </div>
                                
                                <div className="mb-3">
                                    <label htmlFor="feedbackText" className="form-label fw-bold">
                                        Phản hồi và đánh giá buổi tập <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="feedbackText"
                                        rows="6"
                                        placeholder="Ví dụ: Em đã thực hiện tốt các bài tập hôm nay. Tư thế squat đã cải thiện nhiều, tuy nhiên cần chú ý thêm về việc giữ thăng bằng khi nâng tạ. Đề xuất tăng cường luyện tập core exercises trong buổi tới..."
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        maxLength={1000}
                                    ></textarea>
                                    <div className="form-text">
                                        {feedbackText.length}/1000 ký tự
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="card border-primary">
                                            <div className="card-body text-center">
                                                <div className="text-primary mb-2">
                                                    <CheckCircle2 size={32} />
                                                </div>
                                                <h6 className="card-title">Điểm mạnh</h6>
                                                <p className="card-text small text-muted">
                                                    Ghi nhận những điểm học viên thực hiện tốt
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card border-warning">
                                            <div className="card-body text-center">
                                                <div className="text-warning mb-2">
                                                    <Award size={32} />
                                                </div>
                                                <h6 className="card-title">Cần cải thiện</h6>
                                                <p className="card-text small text-muted">
                                                    Đưa ra gợi ý để học viên phát triển hơn
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-outline-secondary" 
                                    onClick={handleCloseFeedbackModal}
                                    disabled={loadingSessions}
                                >
                                    <X size={16} className="me-1" />
                                    Hủy
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-success" 
                                    onClick={handleSubmitFeedback}
                                    disabled={loadingSessions || feedbackText.trim().length < 10}
                                >
                                    {loadingSessions ? (
                                        <>
                                            <div className="spinner-border spinner-border-sm me-2" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={16} className="me-1" />
                                            Hoàn thành buổi tập
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleCalendar;