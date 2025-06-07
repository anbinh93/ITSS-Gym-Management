import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  phone: String,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  birthYear: Number,
  role: { type: String, enum: ['admin', 'staff', 'coach', 'user'], default: 'user' },
  department: String,
  username: { type: String, unique: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const userModel = mongoose.models.User || mongoose.model("User", userSchema);
