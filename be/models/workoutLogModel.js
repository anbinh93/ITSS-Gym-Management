import mongoose from "mongoose";

const workoutLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },
  durationMinutes: Number,
  notes: String,
}, { timestamps: true });

export const workoutLogModel = mongoose.models.WorkoutLog || mongoose.model("WorkoutLog", workoutLogSchema);
