import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

// Dữ liệu giả về các gói tập
const workoutPlans = [
    {
        id: 1,
        name: "Push Day",
        image: "/pushday.jpg",
        description: "Tập trung vào các bài tập đẩy cho phần thân trên",
        exercises: [
            { name: "Bench Press", sets: 4, reps: "8-10", rest: "90 giây" },
            { name: "Shoulder Press", sets: 3, reps: "10-12", rest: "60 giây" },
            { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "60 giây" },
            { name: "Tricep Dips", sets: 3, reps: "12-15", rest: "45 giây" },
            { name: "Chest Fly", sets: 3, reps: "12-15", rest: "45 giây" },
            { name: "Tricep Pushdown", sets: 3, reps: "12-15", rest: "45 giây" }
        ]
    },
    {
        id: 2,
        name: "Pull Day",
        image: "/pullday.jpg",
        description: "Tập trung vào các bài tập kéo cho phần thân trên",
        exercises: [
            { name: "Pull Ups", sets: 4, reps: "6-8", rest: "90 giây" },
            { name: "Bent Over Rows", sets: 3, reps: "10-12", rest: "60 giây" },
            { name: "Lat Pulldown", sets: 3, reps: "10-12", rest: "60 giây" },
            { name: "Face Pull", sets: 3, reps: "12-15", rest: "45 giây" },
            { name: "Bicep Curls", sets: 3, reps: "12-15", rest: "45 giây" },
            { name: "Hammer Curls", sets: 3, reps: "12-15", rest: "45 giây" }
        ]
    },
    {
        id: 3,
        name: "Leg Day",
        image: "/legday.jpg",
        description: "Tập trung vào các bài tập cho chân và cơ đùi",
        exercises: [
            { name: "Squat", sets: 4, reps: "8-10", rest: "120 giây" },
            { name: "Leg Press", sets: 3, reps: "10-12", rest: "90 giây" },
            { name: "Romanian Deadlift", sets: 3, reps: "10-12", rest: "90 giây" },
            { name: "Leg Extension", sets: 3, reps: "12-15", rest: "60 giây" },
            { name: "Leg Curl", sets: 3, reps: "12-15", rest: "60 giây" },
            { name: "Calf Raises", sets: 4, reps: "15-20", rest: "45 giây" }
        ]
    },
    {
        id: 4,
        name: "Cardio",
        image: "/cardio.jpg",
        description: "Tập trung vào các bài tập tim mạch để đốt cháy mỡ thừa",
        exercises: [
            { name: "Chạy bộ", sets: 1, reps: "20 phút", rest: "Không có" },
            { name: "HIIT", sets: 5, reps: "30s hoạt động/30s nghỉ", rest: "1 phút giữa các set" },
            { name: "Bơi lội", sets: 1, reps: "15 phút", rest: "Không có" },
            { name: "Nhảy dây", sets: 3, reps: "5 phút", rest: "2 phút" },
            { name: "Đạp xe", sets: 1, reps: "20 phút", rest: "Không có" },
            { name: "Burpee", sets: 4, reps: "15 lần", rest: "60 giây" }
        ]
    }
];

export default function TrainingProgram() {
    const [selectedPlan, setSelectedPlan] = useState(null);

    // Hiển thị chi tiết gói tập khi được chọn
    const showWorkoutDetails = (plan) => {
        setSelectedPlan(plan);
    };

    // Quay lại màn hình chính
    const goBack = () => {
        setSelectedPlan(null);
    };

    return (
        <div className="container py-4">
            <h1 className="text-center mb-4">Chương trình tập</h1>

            {!selectedPlan ? (
                // Hiển thị danh sách các gói tập
                <div className="row row-cols-1 row-cols-md-2 g-4">
                    {workoutPlans.map((plan) => (
                        <div className="col" key={plan.id}>
                            <div className="card h-100 shadow-sm workout-card">
                                <div
                                    className="card-img-container position-relative overflow-hidden cursor-pointer"
                                    onClick={() => showWorkoutDetails(plan)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <img
                                        src={plan.image}
                                        className="card-img-top"
                                        alt={plan.name}
                                        style={{ height: "200px", objectFit: "cover", transition: "transform 0.5s ease" }}
                                    />
                                </div>
                                <div className="card-body">
                                    <h5 className="card-title">{plan.name}</h5>
                                    <p className="card-text">{plan.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Hiển thị chi tiết của gói tập được chọn
                <div className="workout-details">
                    <div className="d-flex align-items-center mb-4">
                        <button
                            className="btn btn-outline-secondary me-3"
                            onClick={goBack}
                        >
                            <ChevronLeft size={20} />
                            Quay lại
                        </button>
                        <h2 className="mb-0">{selectedPlan.name}</h2>
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-4 mb-3 mb-md-0">
                            <img
                                src={selectedPlan.image}
                                alt={selectedPlan.name}
                                className="img-fluid rounded"
                                style={{ maxHeight: "300px", width: "100%", objectFit: "cover" }}
                            />
                        </div>
                        <div className="col-md-8">
                            <div className="card">
                                <div className="card-header bg-primary text-white">
                                    <h5 className="mb-0">Danh sách bài tập</h5>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-striped table-hover mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Tên bài tập</th>
                                                    <th>Số set</th>
                                                    <th>Số rep</th>
                                                    <th>Thời gian nghỉ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedPlan.exercises.map((exercise, index) => (
                                                    <tr key={index}>
                                                        <td>{exercise.name}</td>
                                                        <td>{exercise.sets}</td>
                                                        <td>{exercise.reps}</td>
                                                        <td>{exercise.rest}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}