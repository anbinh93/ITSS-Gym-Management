import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createWorkoutSchedule,
  getWorkoutScheduleByUser,
  updateWorkoutSchedule,
  deleteWorkoutSchedule,
  markAttendance,
  getWorkoutScheduleByCoach,
  fixCoachForOldSchedules
} from "../controllers/workoutScheduleController.js";

const router = express.Router();

// Tạo lịch tập cho user (staff/coach)
router.post("/user/:userId", authMiddleware, createWorkoutSchedule);
// Lấy lịch tập của user
router.get("/user/:userId", authMiddleware, getWorkoutScheduleByUser);
// Cập nhật lịch tập
router.put("/:scheduleId", authMiddleware, updateWorkoutSchedule);
// Xóa lịch tập
router.delete("/:scheduleId", authMiddleware, deleteWorkoutSchedule);

// User điểm danh buổi tập
router.post("/:scheduleId/attendance", authMiddleware, markAttendance);

// Lấy lịch tập của coach
router.get("/coach/:coachId", authMiddleware, getWorkoutScheduleByCoach);

// Thêm route fix-coach
router.patch("/fix-coach", authMiddleware, fixCoachForOldSchedules);

export default router;
