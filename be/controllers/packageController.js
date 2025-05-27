import { packageModel } from "../models/packageModel.js";

// Tạo gói tập mới
const createPackage = async (req, res) => {
    const { name, durationInDays, sessionLimit, price, withTrainer } = req.body;
    try {
        const newPackage = await packageModel.create({
            name,
            durationInDays,
            sessionLimit,
            price,
            withTrainer,
        });
        res.json({ success: true, package: newPackage });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error creating package" });
    }
};

// Lấy tất cả các gói tập
const getAllPackages = async (req, res) => {
    try {
        const packages = await packageModel.find();
        res.json({ success: true, packages });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error fetching packages" });
    }
};

// Lấy 1 gói tập theo ID
const getPackageById = async (req, res) => {
    const { id } = req.params;
    try {
        const onePackage = await packageModel.findById(id);
        if (!onePackage) return res.json({ success: false, message: "Package not found" });
        res.json({ success: true, package: onePackage });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error fetching package" });
    }
};

// Cập nhật gói tập
const updatePackage = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const updated = await packageModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) return res.json({ success: false, message: "Package not found" });
        res.json({ success: true, package: updated });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error updating package" });
    }
};

// Xoá gói tập
const deletePackage = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await packageModel.findByIdAndDelete(id);
        if (!deleted) return res.json({ success: false, message: "Package not found" });
        res.json({ success: true, message: "Package deleted" });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error deleting package" });
    }
};

export {
    createPackage,
    getAllPackages,
    getPackageById,
    updatePackage,
    deletePackage
};
