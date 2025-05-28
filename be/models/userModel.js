import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  phone: String,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  birthYear: Number,
  role: { type: String, enum: ['MEMBER', 'TRAINER', 'STAFF'], default: 'MEMBER' },
  department: String,
}, { timestamps: true });

export const userModel = mongoose.models.User || mongoose.model("User", userSchema);
