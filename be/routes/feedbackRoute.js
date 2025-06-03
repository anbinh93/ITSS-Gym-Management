import express from "express";
import {
    submitFeedback,
    getFeedbacksByTarget,
    getUserFeedbacks,
    getFeedbackDetail,
    updateFeedbackStatus
} from "../controllers/feedbackController.js";
import authMiddleware from "../middleware/auth.js";

const feedbackRouter = express.Router();

// Tất cả các route đều yêu cầu xác thực
feedbackRouter.use(authMiddleware);

// Gửi phản hồi mới
feedbackRouter.post("/", submitFeedback);

// Lấy phản hồi theo loại (GYM, STAFF, TRAINER)
feedbackRouter.get("/target/:target", getFeedbacksByTarget);

// Lấy phản hồi của user hiện tại
feedbackRouter.get("/my-feedbacks", getUserFeedbacks);

// Lấy chi tiết một phản hồi
feedbackRouter.get("/:id", getFeedbackDetail);

// Cập nhật trạng thái phản hồi
feedbackRouter.patch("/:id/status", updateFeedbackStatus);

export default feedbackRouter;
