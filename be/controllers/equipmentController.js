import { equipmentModel } from "../models/equipmentModel.js";

// Thêm thiết bị
const addEquipment = async (req, res) => {
    const { name, quantity, condition, purchaseDate, warrantyExpiry, notes } = req.body;
    try {
        const equipment = await equipmentModel.create({
            name, quantity, condition, purchaseDate, warrantyExpiry, notes
        });
        res.json({ success: true, equipment });
    } catch {
        res.json({ success: false, message: "Error adding equipment" });
    }
};

// Lấy tất cả thiết bị
const getAllEquipment = async (req, res) => {
    try {
        const list = await equipmentModel.find();
        res.json({ success: true, equipment: list });
    } catch {
        res.json({ success: false, message: "Error fetching equipment" });
    }
};

// Cập nhật thiết bị
const updateEquipment = async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await equipmentModel.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ success: true, equipment: updated });
    } catch {
        res.json({ success: false, message: "Error updating equipment" });
    }
};

// Xóa thiết bị
const deleteEquipment = async (req, res) => {
    const { id } = req.params;
    try {
        await equipmentModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Deleted successfully" });
    } catch {
        res.json({ success: false, message: "Error deleting equipment" });
    }
};

export { addEquipment, getAllEquipment, updateEquipment, deleteEquipment };
