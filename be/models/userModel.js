import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  phone: String,
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'male', 'female', 'other'] },
  birthYear: Number,
  dob: Date, // Date of birth
  address: String, // Address
  emergencyContact: String, // Emergency contact
  membershipType: { type: String, enum: ['basic', 'standard', 'premium'], default: 'basic' },
  startDate: Date, // Membership start date
  expiryDate: Date, // Membership expiry date
  fitnessGoals: String, // Fitness goals
  healthConditions: String, // Health conditions
  profileImage: String, // Profile image URL
  role: { type: String, enum: ['admin', 'staff', 'coach', 'user'], default: 'user' },
  department: String,
  username: { type: String, unique: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const userModel = mongoose.models.User || mongoose.model("User", userSchema);
