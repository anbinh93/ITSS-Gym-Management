import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  condition: { type: String, enum: ['Good', 'Needs Maintenance', 'Broken'], default: 'Good' },
  purchaseDate: Date,
  warrantyExpiry: Date,
  notes: String,
}, { timestamps: true });

export const equipmentModel = mongoose.models.Equipment || mongoose.model("Equipment", equipmentSchema);
