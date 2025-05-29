import { feedbackModel } from "../models/feedbackModel.js";

// Gửi phản hồi
const submitFeedback = async (req, res) => {
    const { userId, rating, message, target, relatedUser } = req.body;
    try {
        const feedback = await feedbackModel.create({ user: userId, rating, message, target, relatedUser });
        res.json({ success: true, feedback });
    } catch {
        res.json({ success: false, message: "Error submitting feedback" });
    }
};

// Lấy phản hồi theo loại (GYM, STAFF, TRAINER)
const getFeedbacksByTarget = async (req, res) => {
    const { target } = req.params;
    try {
        const list = await feedbackModel.find({ target }).populate("user", "name");
        res.json({ success: true, feedbacks: list });
    } catch {
        res.json({ success: false, message: "Error fetching feedbacks" });
    }
};

export { submitFeedback, getFeedbacksByTarget };
