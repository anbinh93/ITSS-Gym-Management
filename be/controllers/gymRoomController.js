import { gymRoomModel } from "../models/gymRoomModel.js";

// Lấy danh sách phòng tập
export const getAllGymRooms = async (req, res) => {
  try {
    const rooms = await gymRoomModel.find();
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error", error: err.message });
  }
};

// Thêm phòng tập
export const createGymRoom = async (req, res) => {
  try {
    const { name, location, capacity, description, status } = req.body;
    // Validate status
    const validStatus = ['available', 'unavailable'];
    const room = await gymRoomModel.create({
      name,
      location,
      capacity,
      description,
      status: validStatus.includes(status) ? status : 'available'
    });
    res.json({ success: true, room });
  } catch (err) {
    res.status(400).json({ success: false, message: "Error", error: err.message });
  }
};

// Sửa phòng tập
export const updateGymRoom = async (req, res) => {
  try {
    const { name, location, capacity, description, status } = req.body;
    // Validate status
    const validStatus = ['available', 'unavailable'];
    const updateData = {
      ...(name && { name }),
      ...(location && { location }),
      ...(capacity && { capacity }),
      ...(description && { description }),
    };
    if (status && validStatus.includes(status)) updateData.status = status;
    const room = await gymRoomModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!room) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, room });
  } catch (err) {
    res.status(400).json({ success: false, message: "Error", error: err.message });
  }
};

// Xóa phòng tập
export const deleteGymRoom = async (req, res) => {
  try {
    const room = await gymRoomModel.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: "Error", error: err.message });
  }
}; 