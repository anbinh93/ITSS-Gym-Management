import express from "express";
import {
    submitFeedback,
    getFeedbacksByTarget
} from "../controllers/feedbackController.js";
import authMiddleware from "../middleware/auth.js";

const feedbackRouter = express.Router();

feedbackRouter.post("/", authMiddleware, submitFeedback);
feedbackRouter.get("/target/:target", getFeedbacksByTarget);

export default feedbackRouter;
