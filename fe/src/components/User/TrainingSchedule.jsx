import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, User, Clock, Award, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getUserWorkoutSchedule } from '../../services/api';
import { getUserWorkoutSessions, createWorkoutSession, checkInWorkoutSession } from '../../services/workoutSessionApi';
import { getActiveMembership } from '../../services/membershipApi';
import authService from '../../services/authService';

export default function UserTrainingSchedule() {
    const [scheduleData, setScheduleData] = useState({});
    const [workoutSessions, setWorkoutSessions] = useState([]);
    const [activeMembership, setActiveMembership] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date());

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError("");
            try {
                const user = authService.getCurrentUser();
                if (!user || !user._id) {
                    setError("Không tìm thấy thông tin người dùng");
                    setLoading(false);
                    return;
                }

                // Fetch schedule data
                const scheduleRes = await getUserWorkoutSchedule(user._id);
                if (scheduleRes && scheduleRes.success) {
                    const map = {};
                    (scheduleRes.schedules || []).forEach(sch => {
                        (sch.schedule || []).forEach(item => {
                            if (item.time && item.time.match(/^\d{4}-\d{2}-\d{2}/)) {
                                if (!map[item.time]) map[item.time] = [];
                                map[item.time].push({
                                    date: item.time,
                                    startTime: item.startTime || '08:00',
                                    endTime: item.endTime || '09:00',
                                    activity: item.exercises?.join(', ') || '',
                                    trainer: sch.coach?.name || null,
                                    coachId: sch.coach?._id || null,
                                    scheduleId: sch._id
                                });
                            }
                        });
                    });
                    setScheduleData(map);
                } else {
                    console.warn('Failed to fetch schedule:', scheduleRes?.message || 'Unknown error');
                }

                // Fetch workout sessions
                const sessionsRes = await getUserWorkoutSessions(user._id, 1, 100);
                if (sessionsRes && sessionsRes.success) {
                    setWorkoutSessions(sessionsRes.workoutSessions || []);
                } else {
                    console.warn('Failed to fetch workout sessions:', sessionsRes?.message || 'Unknown error');
                }

                // Fetch active membership
                const membershipRes = await getActiveMembership(user._id);
                if (membershipRes && membershipRes.success && membershipRes.memberships && membershipRes.memberships.length > 0) {
                    setActiveMembership(membershipRes.memberships[0]);
                } else {
                    console.warn('Failed to fetch membership:', membershipRes?.message || 'Unknown error');
                }

            } catch (err) {
                setError("Lỗi kết nối API");
                console.error('API Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getDaysOfWeek = (date) => {
        const firstDay = new Date(date);
        firstDay.setDate(date.getDate() - date.getDay() + 1);
        return Array.from({ length: 7 }, (_, i) => new Date(firstDay.setDate(firstDay.getDate() + (i === 0 ? 0 : 1))));
    };

    const formatDate = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const getScheduleForSelectedDay = () => {
        return scheduleData[formatDate(selectedDay)] || [];
    };

    // Get workout sessions for selected day
    const getSessionsForSelectedDay = () => {
        const dateStr = formatDate(selectedDay);
        return workoutSessions.filter(session => {
            const sessionDate = new Date(session.workoutDate).toISOString().split('T')[0];
            return sessionDate === dateStr;
        });
    };

    const goToPreviousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const currentWeekDays = getDaysOfWeek(currentDate);

    // Check if date has schedule or sessions
    const hasSchedule = (date) => {
        const dateStr = formatDate(date);
        const hasScheduleData = scheduleData[dateStr] && scheduleData[dateStr].length > 0;
        const hasSessions = workoutSessions.some(session => {
            const sessionDate = new Date(session.workoutDate).toISOString().split('T')[0];
            return sessionDate === dateStr;
        });
        return hasScheduleData || hasSessions;
    };

    // Check if date is today
    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    // Check if date is selected
    const isSelected = (date) => {
        return date.getDate() === selectedDay.getDate() &&
            date.getMonth() === selectedDay.getMonth() &&
            date.getFullYear() === selectedDay.getFullYear();
    };

    // Create workout session for a scheduled item
    const handleCreateSession = async (scheduleItem) => {
        try {
            // Enhanced validation: If user has scheduled training, they should be able to create sessions
            const hasValidSchedule = Object.keys(scheduleData).length > 0;
            
            if (!activeMembership) {
                if (hasValidSchedule) {
                    // User has schedule but no active membership found - show more helpful message
                    alert('Không tìm thấy gói tập active. Vui lòng liên hệ với quản lý hoặc huấn luyện viên để kiểm tra tình trạng membership.');
                } else {
                    alert('Bạn cần có gói tập active để tạo buổi tập!');
                }
                return;
            }

            setLoading(true);
            await createWorkoutSession({
                membershipId: activeMembership._id,
                workoutDate: scheduleItem.date,
                startTime: scheduleItem.startTime,
                endTime: scheduleItem.endTime,
                exerciseName: scheduleItem.activity,
                notes: '',
                coachId: scheduleItem.coachId
            });

            // Refresh data after successful creation
            const user = authService.getCurrentUser();
            const sessionsRes = await getUserWorkoutSessions(user._id, 1, 100);
            if (sessionsRes.success) {
                setWorkoutSessions(sessionsRes.workoutSessions || []);
            }

            alert('Tạo buổi tập thành công!');
        } catch (err) {
            alert('Lỗi khi tạo buổi tập: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // Handle user check-in
    const handleCheckIn = async (sessionId) => {
        try {
            setLoading(true);
            await checkInWorkoutSession(sessionId);
            
            // Refresh data
            const user = authService.getCurrentUser();
            const sessionsRes = await getUserWorkoutSessions(user._id, 1, 100);
            if (sessionsRes.success) {
                setWorkoutSessions(sessionsRes.workoutSessions || []);
            }

            alert('Check-in thành công!');
        } catch (err) {
            alert('Lỗi khi check-in: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-5">Đang tải lịch tập...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container py-5">
            <div className="card shadow border-0 rounded-4">
                <div className="card-header bg-primary bg-gradient text-white p-4 rounded-top-4 border-0">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <Calendar size={28} className="me-3" />
                            <h2 className="h3 mb-0 fw-bold">Lịch Tập Luyện</h2>
                        </div>
                        <span className="badge bg-light text-primary rounded-pill fs-6 px-3 py-2">
                            {new Date().toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                </div>

                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <button className="btn btn-outline-primary d-flex align-items-center" onClick={goToPreviousWeek}>
                            <ChevronLeft size={18} className="me-1" /> Tuần trước
                        </button>
                        <h5 className="fw-bold text-primary mb-0">
                            {currentWeekDays[0].toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}
                            <span className="mx-2">-</span>
                            {currentWeekDays[6].toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}
                        </h5>
                        <button className="btn btn-outline-primary d-flex align-items-center" onClick={goToNextWeek}>
                            Tuần sau <ChevronRight size={18} className="ms-1" />
                        </button>
                    </div>

                    <div className="row g-2 mb-4">
                        {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'].map((day, index) => {
                            const dayDate = currentWeekDays[index];
                            const hasTraining = hasSchedule(dayDate);
                            const todayClass = isToday(dayDate) ? 'border-primary border-2' : '';
                            const selectedClass = isSelected(dayDate) ? 'active' : '';

                            return (
                                <div key={index} className="col">
                                    <div
                                        className={`card h-100 ${todayClass} ${selectedClass}`}
                                        onClick={() => setSelectedDay(dayDate)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className={`card-header text-center py-2 ${isSelected(dayDate) ? 'bg-primary text-white' : hasTraining ? 'bg-success bg-opacity-75 text-white' : 'bg-light'}`}>
                                            <strong>{day}</strong>
                                        </div>
                                        <div className={`card-body p-0 text-center ${isSelected(dayDate) ? 'bg-primary bg-opacity-10' : hasTraining ? 'bg-success bg-opacity-10' : ''}`}>
                                            <h5 className="display-6 my-3">{dayDate.getDate()}</h5>
                                            <p className="small mb-2">{dayDate.toLocaleDateString('vi-VN', { month: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="card mb-0 border-0 bg-light bg-opacity-50">
                        <div className="card-header bg-transparent border-bottom border-primary">
                            <h5 className="mb-0">
                                <CalendarIcon size={18} className="me-2" />
                                Lịch ngày {selectedDay.toLocaleDateString('vi-VN', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'numeric',
                                    year: 'numeric'
                                })}
                            </h5>
                        </div>
                        <div className="card-body p-3">
                            {/* Display scheduled items */}
                            {getScheduleForSelectedDay().length > 0 && (
                                <div className="mb-4">
                                    <h6 className="text-primary fw-bold mb-3">
                                        <Calendar size={16} className="me-2" />
                                        Lịch tập được xếp
                                    </h6>
                                    <div className="row g-3">
                                        {getScheduleForSelectedDay().map((item, index) => {
                                            // Check if there's already a session for this schedule item
                                            const existingSession = workoutSessions.find(session => {
                                                const sessionDate = new Date(session.workoutDate).toISOString().split('T')[0];
                                                const scheduleDate = item.date;
                                                const sessionTime = `${session.startTime}-${session.endTime}`;
                                                const scheduleTime = `${item.startTime}-${item.endTime}`;
                                                
                                                // More precise matching: date, exercise name, and time
                                                const isMatch = sessionDate === scheduleDate && 
                                                              session.exerciseName === item.activity &&
                                                              sessionTime === scheduleTime;
                                                
                                                return isMatch;
                                            });

                                            return (
                                                <div key={index} className="col-md-6">
                                                    <div className="card h-100 border-0 shadow-sm">
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between mb-3">
                                                                <h6 className="fw-bold text-primary mb-0">{item.activity}</h6>
                                                                <span className="badge bg-primary rounded-pill d-flex align-items-center">
                                                                    <Clock size={14} className="me-1" /> 
                                                                    {item.startTime} - {item.endTime}
                                                                </span>
                                                            </div>
                                                            <div className="d-flex align-items-center mb-3">
                                                                <div className="rounded-circle bg-light p-2 me-2">
                                                                    <User size={20} className="text-primary" />
                                                                </div>
                                                                <span>
                                                                    {item.trainer ? (
                                                                        <>
                                                                            <span className="text-muted small">HLV:</span> {item.trainer}
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-muted small">Tự tập</span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="mt-3">
                                                                {existingSession ? (
                                                                    <div className="d-flex align-items-center flex-wrap gap-2">
                                                                        {existingSession.status === 'scheduled' && (
                                                                            <button 
                                                                                className="btn btn-success btn-sm"
                                                                                onClick={() => handleCheckIn(existingSession._id)}
                                                                                disabled={loading}
                                                                            >
                                                                                Check-in
                                                                            </button>
                                                                        )}
                                                                        {existingSession.status === 'checked_in' && (
                                                                            <span className="badge bg-warning">
                                                                                Đã check-in - Chờ HLV check-out
                                                                            </span>
                                                                        )}
                                                                        {existingSession.status === 'completed' && (
                                                                            <span className="badge bg-success">
                                                                                Đã hoàn thành
                                                                            </span>
                                                                        )}                                                        {existingSession.status === 'cancelled' && (
                                                            <span className="badge bg-danger">
                                                                Đã hủy
                                                            </span>
                                                        )}
                                                        {!existingSession.status && (
                                                            <>
                                                                {existingSession.isConfirmed ? (
                                                                    <>
                                                                        <CheckCircle2 size={16} className="text-success me-2" />
                                                                        <span className="badge bg-success">Đã xác nhận</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <XCircle size={16} className="text-warning me-2" />
                                                                        <span className="badge bg-warning">Chờ xác nhận</span>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <button 
                                                                        className="btn btn-outline-primary btn-sm"
                                                                        onClick={() => handleCreateSession(item)}
                                                                        disabled={loading}
                                                                    >
                                                                        Tạo buổi tập
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Display workout sessions */}
                            {getSessionsForSelectedDay().length > 0 && (
                                <div className="mb-4">
                                    <h6 className="text-success fw-bold mb-3">
                                        <Award size={16} className="me-2" />
                                        Buổi tập đã tạo
                                    </h6>
                                    <div className="row g-3">
                                        {getSessionsForSelectedDay().map((session, index) => (
                                            <div key={index} className="col-md-6">
                                                <div className="card h-100 border-0 shadow-sm">
                                                    <div className="card-body">
                                                        <div className="d-flex justify-content-between mb-3">
                                                            <h6 className="fw-bold text-success mb-0">{session.exerciseName}</h6>
                                                            <span className="badge bg-success rounded-pill d-flex align-items-center">
                                                                <Clock size={14} className="me-1" /> 
                                                                {session.startTime} - {session.endTime}
                                                            </span>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-3">
                                                            <div className="rounded-circle bg-light p-2 me-2">
                                                                <User size={20} className="text-success" />
                                                            </div>
                                                            <span>
                                                                {session.coach ? (
                                                                    <>
                                                                        <span className="text-muted small">HLV:</span> {session.coach.name}
                                                                    </>
                                                                ) : (
                                                                    <span className="text-muted small">Tự tập</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        {session.notes && session.status === 'completed' && (
                                                            <div className="alert alert-light border-primary bg-primary bg-opacity-10 mb-3">
                                                                <div className="d-flex align-items-start">
                                                                    <div className="text-primary me-2 mt-1">
                                                                        <Award size={16} />
                                                                    </div>
                                                                    <div className="flex-grow-1">
                                                                        <h6 className="alert-heading fs-6 mb-2 text-primary">
                                                                            💬 Phản hồi từ huấn luyện viên
                                                                        </h6>
                                                                        <p className="mb-0 small" style={{whiteSpace: 'pre-wrap'}}>
                                                                            {session.notes}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {session.notes && session.status !== 'completed' && (
                                                            <div className="mb-3">
                                                                <small className="text-muted">
                                                                    <strong>Ghi chú:</strong> {session.notes}
                                                                </small>
                                                            </div>
                                                        )}                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center gap-2">
                                                {/* Display primary status first */}
                                                {session.status === 'scheduled' && (
                                                    <button 
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => handleCheckIn(session._id)}
                                                        disabled={loading}
                                                    >
                                                        Check-in
                                                    </button>
                                                )}
                                                {session.status === 'checked_in' && (
                                                    <span className="badge bg-warning">
                                                        Đã check-in - Chờ HLV check-out
                                                    </span>
                                                )}
                                                {session.status === 'completed' && (
                                                    <span className="badge bg-success">
                                                        Đã hoàn thành
                                                    </span>
                                                )}
                                                {session.status === 'cancelled' && (
                                                    <span className="badge bg-danger">
                                                        Đã hủy
                                                    </span>
                                                )}
                                                {/* Fallback to confirmation status if no status is set */}
                                                {!session.status && (
                                                    <>
                                                        {session.isConfirmed ? (
                                                            <>
                                                                <CheckCircle2 size={16} className="text-success me-2" />
                                                                <span className="badge bg-success">Đã xác nhận</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle size={16} className="text-warning me-2" />
                                                                <span className="badge bg-warning">Chờ xác nhận</span>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <small className="text-muted">
                                                {new Date(session.createdAt).toLocaleString('vi-VN')}
                                            </small>
                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No schedule or sessions message */}
                            {getScheduleForSelectedDay().length === 0 && getSessionsForSelectedDay().length === 0 && (
                                <div className="text-center py-5">
                                    <div className="mb-3">
                                        <Award size={48} className="text-muted" />
                                    </div>
                                    <h5 className="text-muted">Không có lịch tập cho ngày này</h5>
                                    <p className="text-muted small mb-0">
                                        Hãy chọn một ngày khác hoặc liên hệ với huấn luyện viên để đặt lịch
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}