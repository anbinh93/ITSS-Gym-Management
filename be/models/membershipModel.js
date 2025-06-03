import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  package: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
  startDate: Date,
  endDate: Date,
  sessionsRemaining: Number,
  isActive: Boolean,
  paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
}, { timestamps: true });

export const membershipModel = mongoose.models.Membership || mongoose.model("Membership", membershipSchema);
