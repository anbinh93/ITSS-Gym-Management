import express from 'express';
import * as workoutSessionController from '../controllers/workoutSessionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Tạo workout session mới
router.post('/', authMiddleware, workoutSessionController.createWorkoutSession);

// Lấy workout sessions của user
router.get('/user/:userId', authMiddleware, workoutSessionController.getUserWorkoutSessions);

// Lấy tiến độ workout của user
router.get('/user/:userId/progress', authMiddleware, workoutSessionController.getUserWorkoutProgress);

// Xác nhận workout session (dành cho coach/staff)
router.patch('/:sessionId/confirm', authMiddleware, workoutSessionController.confirmWorkoutSession);

// Lấy danh sách sessions chờ xác nhận (dành cho coach)
router.get('/pending', authMiddleware, workoutSessionController.getPendingWorkoutSessions);

// Lấy sessions theo membership
router.get('/membership/:membershipId', authMiddleware, workoutSessionController.getSessionsByMembership);

// Check-in workout session (user)
router.patch('/:sessionId/checkin', authMiddleware, workoutSessionController.checkInWorkoutSession);

// Check-out workout session (coach)
router.patch('/:sessionId/checkout', authMiddleware, workoutSessionController.checkOutWorkoutSession);

// Lấy thống kê workout cho progress
router.get('/user/:userId/stats', authMiddleware, workoutSessionController.getWorkoutStats);

export default router;
