import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ChevronLeft, ChevronRight, Edit2, Save, X, Plus, Users, User, Search } from 'lucide-react';
import './Schedule.css';

// Sample data structure with multiple trainees
const initialTrainees = [
    { id: 1, name: 'Vũ Ngọc Duku' },
    { id: 2, name: 'Wean Lee' },
    { id: 3, name: 'Quyết Strong' },
    { id: 4, name: 'Đặng Hải Anh' },
];

const initialWorkouts = {
    1: { // Trainee ID 1
        '2025-04-24': {
            title: 'Tập ngực và tay sau',
            description: 'Bench Press: 4x12\nFlying: 3x15\nTriceps Extensions: 4x12\nTriceps Dips: 3x15'
        },
        '2025-04-25': {
            title: 'Chân và bụng',
            description: 'Squat: 4x10\nLeg Press: 3x12\nCrunches: 3x20\nPlank: 3x60 giây'
        },
        '2025-04-26': {
            title: 'Tập lưng và tay trước',
            description: 'Pull-ups: 4x8\nBarbell Row: 3x12\nBiceps Curl: 4x12\nHammer Curl: 3x15'
        },
    },
    2: { // Trainee ID 2
        '2025-04-25': {
            title: 'Cardio và Core',
            description: 'Running: 30 phút\nPlank variations: 3 sets\nRussian twists: 3x20\nMountain climbers: 3x30 seconds'
        },
        '2025-04-27': {
            title: 'Toàn thân',
            description: 'Circuit training: 4 rounds\nBurpees: 12\nKettlebell swings: 15\nLunges: 10 mỗi chân\nPush-ups: 15'
        }
    },
    3: { // Trainee ID 3
        '2025-04-24': {
            title: 'Vai và tay',
            description: 'Shoulder press: 4x10\nLateral raises: 3x12\nFront raises: 3x12\nBicep curls: 4x10'
        },
        '2025-04-26': {
            title: 'Ngày chân',
            description: 'Squat: 5x5\nLunges: 3x10\nLeg extensions: 3x12\nCalf raises: 4x15'
        }
    },
    4: { // Trainee ID 4
        '2025-04-25': {
            title: 'Yoga và Stretching',
            description: 'Sun salutations: 10 minutes\nWarrior poses: 5 minutes\nDeep stretching: 15 minutes\nMeditation: 10 minutes'
        }
    }
};

function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

const ScheduleCalendar = () => {
    const [value, setValue] = useState(new Date());
    const [activeStartDate, setActiveStartDate] = useState(new Date());
    const [trainees, setTrainees] = useState(initialTrainees);
    const [workouts, setWorkouts] = useState(initialWorkouts);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempWorkout, setTempWorkout] = useState({ title: '', description: '' });
    const [selectedTraineeId, setSelectedTraineeId] = useState(null); // null means "All trainees"
    const [showTraineeSelector, setShowTraineeSelector] = useState(false);

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

    const handleSaveWorkout = () => {
        if (!selectedDate || !selectedTraineeId) return;

        const dateKey = formatDateKey(selectedDate);
        const updatedWorkouts = { ...workouts };

        // Ensure trainee exists in workout object
        if (!updatedWorkouts[selectedTraineeId]) {
            updatedWorkouts[selectedTraineeId] = {};
        }

        if (tempWorkout.title.trim() === '') {
            // Delete workout if title is empty
            if (updatedWorkouts[selectedTraineeId][dateKey]) {
                delete updatedWorkouts[selectedTraineeId][dateKey];
            }
        } else {
            // Add or update workout
            updatedWorkouts[selectedTraineeId][dateKey] = { ...tempWorkout };
        }

        setWorkouts(updatedWorkouts);
        setIsEditing(false);
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

    const handleTraineeSelect = (traineeId) => {
        setSelectedTraineeId(traineeId);
        setShowTraineeSelector(false);

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
        trainee.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                                                    rows="10"
                                                    placeholder="Nhập chi tiết bài tập (mỗi bài tập một dòng)"
                                                    value={tempWorkout.description}
                                                    onChange={(e) => setTempWorkout({ ...tempWorkout, description: e.target.value })}
                                                ></textarea>
                                            </div>

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
                                            {/* Show workouts for the selected date */}
                                            {getWorkoutsForDate(selectedDate).length > 0 ? (
                                                <div>
                                                    {getWorkoutsForDate(selectedDate).map((workout, index) => (
                                                        <div key={index} className="workout-item mb-4">
                                                            {!selectedTraineeId && (
                                                                <div className="d-flex align-items-center mb-2">
                                                                    <User size={16} className="text-primary me-2" />
                                                                    <span className="fw-bold">{workout.traineeName}</span>
                                                                </div>
                                                            )}

                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                <h5 className="fw-bold text-primary mb-0">{workout.title}</h5>
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
                                                                <hr className="my-3" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
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