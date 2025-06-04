import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, User, Clock, Award, Calendar as CalendarIcon } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getUserWorkoutSchedule } from '../../services/api';
import { fetchWithAuth } from '../../services/api';

export default function UserTrainingSchedule() {
    const [scheduleData, setScheduleData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [attendanceMap, setAttendanceMap] = useState({});

    useEffect(() => {
        const fetchSchedule = async () => {
            setLoading(true);
            setError("");
            try {
                const user = JSON.parse(localStorage.getItem('gym_user'));
                if (!user || !user._id) {
                    setError("Không tìm thấy thông tin người dùng");
                    setLoading(false);
                    return;
                }
                const res = await getUserWorkoutSchedule(user._id);
                if (res.success) {
                    // Chuyển đổi dữ liệu từ API về dạng { yyyy-mm-dd: [ {time, activity, trainer, scheduleId, attendance} ] }
                    const map = {};
                    const attMap = {};
                    (res.schedules || []).forEach(sch => {
                        (sch.schedule || []).forEach(item => {
                            if (item.time && item.time.match(/^\d{4}-\d{2}-\d{2}/)) {
                                if (!map[item.time]) map[item.time] = [];
                                map[item.time].push({
                                    time: item.time,
                                    activity: item.exercises?.join(', ') || '',
                                    trainer: sch.coach?.name || null,
                                    scheduleId: sch._id,
                                    attendance: sch.attendance || []
                                });
                                // Lưu trạng thái attendance cho từng scheduleId
                                attMap[sch._id] = sch.attendance || [];
                            }
                        });
                    });
                    setScheduleData(map);
                    setAttendanceMap(attMap);
                } else {
                    setError(res.message || "Không thể tải lịch tập");
                }
            } catch (err) {
                setError("Lỗi kết nối API");
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
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

    // Kiểm tra xem ngày có lịch tập không
    const hasSchedule = (date) => {
        return scheduleData[formatDate(date)] ? true : false;
    };

    // Kiểm tra xem ngày có phải là ngày hôm nay không
    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    // Kiểm tra xem ngày có được chọn không
    const isSelected = (date) => {
        return date.getDate() === selectedDay.getDate() &&
            date.getMonth() === selectedDay.getMonth() &&
            date.getFullYear() === selectedDay.getFullYear();
    };

    // Hàm điểm danh
    const handleAttendance = async (scheduleId) => {
        try {
            setLoading(true);
            await fetchWithAuth(`/api/schedule/${scheduleId}/attendance`, { method: 'POST' });
            // Sau khi điểm danh, reload lại lịch tập
            const user = JSON.parse(localStorage.getItem('gym_user'));
            const res = await getUserWorkoutSchedule(user._id);
            if (res.success) {
                const map = {};
                const attMap = {};
                (res.schedules || []).forEach(sch => {
                    (sch.schedule || []).forEach(item => {
                        if (item.time && item.time.match(/^\d{4}-\d{2}-\d{2}/)) {
                            if (!map[item.time]) map[item.time] = [];
                            map[item.time].push({
                                time: item.time,
                                activity: item.exercises?.join(', ') || '',
                                trainer: sch.coach?.name || null,
                                scheduleId: sch._id,
                                attendance: sch.attendance || []
                            });
                            attMap[sch._id] = sch.attendance || [];
                        }
                    });
                });
                setScheduleData(map);
                setAttendanceMap(attMap);
            }
        } catch (err) {
            alert('Lỗi khi xác nhận buổi tập!');
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
                            {getScheduleForSelectedDay().length ? (
                                <div className="row g-3">
                                    {getScheduleForSelectedDay().map((item, index) => {
                                        const user = JSON.parse(localStorage.getItem('gym_user'));
                                        const attended = item.attendance && user && item.attendance.includes(user._id);
                                        return (
                                            <div key={index} className="col-md-6">
                                                <div className="card h-100 border-0 shadow-sm hover-shadow">
                                                    <div className="card-body">
                                                        <div className="d-flex justify-content-between mb-3">
                                                            <h6 className="fw-bold text-primary mb-0">{item.activity}</h6>
                                                            <span className="badge bg-primary rounded-pill d-flex align-items-center">
                                                                <Clock size={14} className="me-1" /> {item.time}
                                                            </span>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <div className="rounded-circle bg-light p-2 me-2">
                                                                <User size={20} className="text-primary" />
                                                            </div>
                                                            <span>
                                                                {item.trainer ? (
                                                                    <>
                                                                        <span className="text-muted small">HLV:</span> {item.trainer}
                                                                    </>
                                                                ) : (
                                                                    <span className="text-muted small">Không rõ HLV</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        {/* Nút xác nhận điểm danh */}
                                                        <div className="mt-3">
                                                            {attended ? (
                                                                <span className="badge bg-success">Đã xác nhận</span>
                                                            ) : (
                                                                <button className="btn btn-outline-success btn-sm" onClick={() => handleAttendance(item.scheduleId)}>
                                                                    Xác nhận đã tập
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
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