import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
  name: String,
  durationInDays: Number,
  sessionLimit: Number,
  price: Number,
  withTrainer: { type: Boolean, default: false },
}, { timestamps: true });

export const packageModel = mongoose.models.Package || mongoose.model("Package", packageSchema);
