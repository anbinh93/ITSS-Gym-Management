import { workoutModel } from "../models/workoutModel.js";

// Ghi nhận buổi tập
const logWorkout = async (req, res) => {
    const { userId, trainerId, durationMinutes, notes } = req.body;
    try {
        const workout = await workoutModel.create({
            user: userId,
            trainer: trainerId,
            durationMinutes,
            notes,
            date: new Date()
        });
        res.json({ success: true, workout });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error logging workout" });
    }
};

// Lấy lịch sử tập của 1 hội viên
const getWorkoutByUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const logs = await workoutModel.find({ user: userId }).populate("trainer", "name");
        res.json({ success: true, workouts: logs });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error fetching logs" });
    }
};

export { logWorkout, getWorkoutByUser };
