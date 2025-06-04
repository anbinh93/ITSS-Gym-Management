import mongoose from "mongoose";

const workoutScheduleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // nếu có
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // staff/coach tạo
  schedule: [
    {
      dayOfWeek: {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
      exercises: [String], // hoặc chi tiết hơn: [{name, sets, reps, ...}]
      time: String, // ví dụ: "18:00-19:00"
    },
  ],
  note: String,
  attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // user đã điểm danh
  createdAt: { type: Date, default: Date.now },
});

export const workoutScheduleModel =
  mongoose.models.WorkoutSchedule ||
  mongoose.model("WorkoutSchedule", workoutScheduleSchema);
