import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ChevronLeft, ChevronRight, Edit2, Save, X, Plus, Users, User, Search, CheckCircle2, XCircle, Award } from 'lucide-react';
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
                                                            )}

                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                <h6 className="fw-bold text-primary mb-0">{workout.title}</h6>
                                                                {selectedTraineeId && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                                                        onClick={handleEditWorkout}
                                                                    >
                                                                        <Edit2 size={16} />
                                                                        Chỉnh sửa
                                                                    </button>
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

                                                            {session.notes && (
                                                                <p className="text-muted small mb-2">{session.notes}</p>
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
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleCheckOutSession(session._id)}
                                                            disabled={loadingSessions}
                                                        >
                                                            <CheckCircle2 size={14} className="me-1" />
                                                            {loadingSessions ? 'Đang xử lý...' : 'Hoàn thành'}
                                                        </button>
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
        </div>
    );
};

export default ScheduleCalendar;