import mongoose from "mongoose";
const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  weightHeight: [
    { date: String, weight: Number, height: Number }
  ],
  calories: [
    { date: String, goal: Number, actual: Number }
  ],
  bodyFat: [
    { date: String, value: Number }
  ]
});
export const progressModel = mongoose.models.Progress || mongoose.model("Progress", progressSchema); 