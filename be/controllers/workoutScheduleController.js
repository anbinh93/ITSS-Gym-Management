import { workoutScheduleModel } from "../models/workoutScheduleModel.js";
import { userModel } from "../models/userModel.js";
import mongoose from "mongoose";

// Tạo lịch tập cho user
export const createWorkoutSchedule = async (req, res) => {
  try {
    const { userId } = req.params;
    const { schedule, note, coach } = req.body;
    console.log("[DEBUG][CREATE] Body:", req.body);
    // Chỉ staff/coach mới được tạo
    const creator = await userModel.findById(req.user.id);
    console.log("[DEBUG][CREATE] Creator:", creator);
    if (!creator || !["staff", "coach"].includes(creator.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "Không có quyền truy cập" 
      });
    }
    // Nếu là coach tạo và không truyền coach, tự động gán coach là chính mình
    let coachId = coach;
    if (!coachId && creator.role === 'coach') {
      coachId = req.user.id;
    }
    console.log("[DEBUG][CREATE] Sẽ gán coachId:", coachId);
    const newSchedule = await workoutScheduleModel.create({
      user: userId,
      coach: coachId || undefined,
      createdBy: req.user.id,
      schedule,
      note,
    });
    console.log("[DEBUG][CREATE] Schedule vừa tạo:", newSchedule);
    res.status(201).json({ 
      success: true, 
      workoutSchedule: newSchedule 
    });
  } catch (err) {
    console.error("[DEBUG][CREATE] Error creating workout schedule:", err);
    res.status(400).json({ 
      success: false, 
      message: err.message || "Lỗi khi tạo lịch tập" 
    });
  }
};

// Lấy lịch tập của user
export const getWorkoutScheduleByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    // Log toàn bộ thông tin request để debug
    console.log("[DEBUG][GET] GET /api/schedule/user/:userId");
    console.log("[DEBUG][GET] Headers:", req.headers);
    console.log("[DEBUG][GET] Params:", req.params);
    console.log("[DEBUG][GET] User (from auth):", req.user);
    // Kiểm tra userId hợp lệ
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      console.log("[DEBUG][GET] userId không hợp lệ:", userId);
      return res.status(400).json({ success: false, message: "userId không hợp lệ" });
    }
    
    // Chỉ user đó hoặc staff/coach mới được xem
    // if (req.user.role === "user" && req.user.id !== userId) {
    //   return res.status(403).json({ 
    //     success: false, 
    //     message: "Không có quyền truy cập" 
    //   });
    // }

    const schedules = await workoutScheduleModel
      .find({ user: userId })
      .populate("coach", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });
    console.log("[DEBUG][GET] Schedules trả về:", JSON.stringify(schedules, null, 2));
    res.json({ 
      success: true, 
      schedules 
    });
  } catch (err) {
    console.error("[DEBUG][GET] Error getting workout schedules by user:", err);
    res.status(400).json({ 
      success: false, 
      message: err.message || "Lỗi khi lấy lịch tập của người dùng" 
    });
  }
};

// Lấy lịch tập của coach (tất cả học viên do coach phụ trách)
export const getWorkoutScheduleByCoach = async (req, res) => {
  try {
    const { coachId } = req.params;
    
    // Chỉ coach đó hoặc staff mới được xem
    if (req.user.role === "user" && req.user.id !== coachId) {
      return res.status(403).json({ 
        success: false, 
        message: "Không có quyền truy cập" 
      });
    }

    const schedules = await workoutScheduleModel
      .find({ coach: coachId })
      .populate("user", "name email")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      schedules 
    });
  } catch (err) {
    console.error("Error getting workout schedules by coach:", err);
    res.status(400).json({ 
      success: false, 
      message: err.message || "Lỗi khi lấy lịch tập của huấn luyện viên" 
    });
  }
};

// Cập nhật lịch tập
export const updateWorkoutSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { schedule, note } = req.body;
    
    // Kiểm tra schedule có tồn tại không
    const existingSchedule = await workoutScheduleModel.findById(scheduleId);
    if (!existingSchedule) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch tập"
      });
    }

    // Chỉ staff/coach mới được sửa
    const updater = await userModel.findById(req.user.id);
    if (!updater || !["staff", "coach"].includes(updater.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "Không có quyền truy cập" 
      });
    }

    const updated = await workoutScheduleModel.findByIdAndUpdate(
      scheduleId,
      { 
        schedule, 
        note,
        updatedAt: new Date()
      },
      { new: true }
    ).populate("coach", "name email")
     .populate("createdBy", "name email role");

    res.json({ 
      success: true, 
      workoutSchedule: updated 
    });
  } catch (err) {
    console.error("Error updating workout schedule:", err);
    res.status(400).json({ 
      success: false, 
      message: err.message || "Lỗi khi cập nhật lịch tập" 
    });
  }
};

// Xóa lịch tập
export const deleteWorkoutSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    // Kiểm tra schedule có tồn tại không
    const existingSchedule = await workoutScheduleModel.findById(scheduleId);
    if (!existingSchedule) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch tập"
      });
    }

    // Chỉ staff/coach mới được xóa
    const deleter = await userModel.findById(req.user.id);
    if (!deleter || !["staff", "coach"].includes(deleter.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "Không có quyền truy cập" 
      });
    }

    await workoutScheduleModel.findByIdAndDelete(scheduleId);
    
    res.json({ 
      success: true,
      message: "Xóa lịch tập thành công"
    });
  } catch (err) {
    console.error("Error deleting workout schedule:", err);
    res.status(400).json({ 
      success: false, 
      message: err.message || "Lỗi khi xóa lịch tập" 
    });
  }
};

// User điểm danh buổi tập
export const markAttendance = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const userId = req.user.id;
    
    const schedule = await workoutScheduleModel.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy lịch tập" 
      });
    }

    // Chỉ user được gán mới được điểm danh
    if (String(schedule.user) !== String(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: "Không có quyền điểm danh lịch tập này" 
      });
    }

    // Nếu đã điểm danh thì không thêm nữa
    if (schedule.attendance && schedule.attendance.includes(userId)) {
      return res.json({ 
        success: true, 
        message: "Đã điểm danh trước đó" 
      });
    }

    // Thêm điểm danh
    schedule.attendance = schedule.attendance || [];
    schedule.attendance.push(userId);
    schedule.lastAttendance = new Date();
    await schedule.save();

    res.json({ 
      success: true, 
      message: "Điểm danh thành công" 
    });
  } catch (err) {
    console.error("Error marking attendance:", err);
    res.status(400).json({ 
      success: false, 
      message: err.message || "Lỗi khi điểm danh" 
    });
  }
};

// Lấy tất cả lịch tập (dành cho staff)
export const getAllWorkoutSchedules = async (req, res) => {
  try {
    // Chỉ staff mới được xem tất cả
    if (req.user.role !== "staff") {
      return res.status(403).json({ 
        success: false, 
        message: "Không có quyền truy cập" 
      });
    }

    const { page = 1, limit = 10, userId, coachId } = req.query;
    const query = {};

    // Filter theo userId nếu có
    if (userId) {
      query.user = userId;
    }

    // Filter theo coachId nếu có
    if (coachId) {
      query.coach = coachId;
    }

    const schedules = await workoutScheduleModel
      .find(query)
      .populate("user", "name email")
      .populate("coach", "name email")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await workoutScheduleModel.countDocuments(query);

    res.json({ 
      success: true, 
      schedules,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error("Error getting all workout schedules:", err);
    res.status(400).json({ 
      success: false, 
      message: err.message || "Lỗi khi lấy danh sách lịch tập" 
    });
  }
};

// API cập nhật lại các lịch tập cũ: nếu thiếu coach và createdBy là coach thì gán coach = createdBy
export const fixCoachForOldSchedules = async (req, res) => {
  try {
    const schedules = await workoutScheduleModel.find({ $or: [ { coach: { $exists: false } }, { coach: null } ] }).populate('createdBy', 'role');
    let updatedCount = 0;
    for (const sch of schedules) {
      if (sch.createdBy && sch.createdBy.role === 'coach') {
        sch.coach = sch.createdBy._id;
        await sch.save();
        updatedCount++;
        console.log(`[DEBUG][FIX-COACH] Đã cập nhật schedule ${sch._id}: coach = ${sch.coach}`);
      }
    }
    res.json({ success: true, updated: updatedCount });
  } catch (err) {
    console.error('[DEBUG][FIX-COACH] Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};