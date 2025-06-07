import mongoose from "mongoose";

const workoutSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  membership: { type: mongoose.Schema.Types.ObjectId, ref: "Membership", required: true },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // HLV phụ trách (nếu có)
  workoutDate: { type: Date, required: true },
  startTime: { type: String, required: true }, // "HH:mm"
  endTime: { type: String, required: true }, // "HH:mm"
  exerciseName: { type: String, required: true }, // Tên bài tập
  isConfirmed: { type: Boolean, default: false }, // Xác nhận từ lịch tập
  
  // Check-in/Check-out flow
  status: { 
    type: String, 
    enum: ['scheduled', 'checked_in', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  checkedInAt: Date, // Thời gian user check-in
  checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User check-in
  checkedOutAt: Date, // Thời gian HLV check-out
  checkedOutBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // HLV check-out
  
  notes: String,
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Ai xác nhận (coach/staff)
  confirmedAt: Date
}, { timestamps: true });

// Index để tối ưu truy vấn
workoutSessionSchema.index({ user: 1, workoutDate: -1 });
workoutSessionSchema.index({ membership: 1 });

export const workoutSessionModel = mongoose.models.WorkoutSession || mongoose.model("WorkoutSession", workoutSessionSchema);
