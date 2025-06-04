import { progressModel } from "../models/progressModel.js";
import { membershipModel } from "../models/membershipModel.js";

// Lấy progress theo userId
export const getProgressByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await progressModel.findOne({ user: userId });
    res.json({ success: true, progress });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Cập nhật progress theo userId
export const updateProgressByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { weightHeight, calories, bodyFat } = req.body;
    // Chỉ cho phép coach update học viên mình phụ trách
    if (req.user.role === 'coach') {
      const membership = await membershipModel.findOne({ user: userId, coach: req.user.id, isActive: true });
      if (!membership) {
        return res.status(403).json({ success: false, message: "Bạn không có quyền chỉnh sửa học viên này" });
      }
    }
    let progress = await progressModel.findOne({ user: userId });
    if (!progress) {
      progress = await progressModel.create({ user: userId, weightHeight, calories, bodyFat });
    } else {
      progress.weightHeight = weightHeight;
      progress.calories = calories;
      progress.bodyFat = bodyFat;
      await progress.save();
    }
    res.json({ success: true, progress });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}; 