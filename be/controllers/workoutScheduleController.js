import { workoutScheduleModel } from "../models/workoutScheduleModel.js";
import { userModel } from "../models/userModel.js";

// Tạo lịch tập cho user
export const createWorkoutSchedule = async (req, res) => {
  try {
    const { userId } = req.params;
    const { schedule, note, coach } = req.body;
    // Chỉ staff/coach mới được tạo
    const creator = await userModel.findById(req.user.id);
    if (!creator || !['staff', 'coach'].includes(creator.role)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const newSchedule = await workoutScheduleModel.create({
      user: userId,
      coach: coach || undefined,
      createdBy: req.user.id,
      schedule,
      note
    });
    res.status(201).json({ success: true, workoutSchedule: newSchedule });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Lấy lịch tập của user
export const getWorkoutScheduleByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    // Chỉ user đó hoặc staff/coach mới được xem
    if (req.user.role === 'user' && req.user.id !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const schedules = await workoutScheduleModel.find({ user: userId }).populate('coach', 'name email').populate('createdBy', 'name email role');
    res.json({ success: true, schedules });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Cập nhật lịch tập
export const updateWorkoutSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { schedule, note } = req.body;
    // Chỉ staff/coach mới được sửa
    const updater = await userModel.findById(req.user.id);
    if (!updater || !['staff', 'coach'].includes(updater.role)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const updated = await workoutScheduleModel.findByIdAndUpdate(scheduleId, { schedule, note }, { new: true });
    res.json({ success: true, workoutSchedule: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Xóa lịch tập
export const deleteWorkoutSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    // Chỉ staff/coach mới được xóa
    const deleter = await userModel.findById(req.user.id);
    if (!deleter || !['staff', 'coach'].includes(deleter.role)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    await workoutScheduleModel.findByIdAndDelete(scheduleId);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}; 