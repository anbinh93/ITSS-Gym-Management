import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, min: 1, max: 5 },
  message: String,
  target: { type: String, enum: ['GYM', 'STAFF', 'TRAINER'] },
  relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const feedbackModel = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
