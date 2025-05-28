import { membershipModel } from "../models/membershipModel.js";
// import { userModel } from "../models/userModel.js";
import { feedbackModel } from "../models/feedbackModel.js";

// Doanh thu cơ bản (tổng tiền từ các gói đã mua)
const getRevenue = async (req, res) => {
    try {
        const data = await membershipModel.find().populate("package");
        const revenue = data.reduce((sum, m) => sum + (m.package?.price || 0), 0);
        res.json({ success: true, revenue });
    } catch {
        res.json({ success: false, message: "Error calculating revenue" });
    }
};

// Hội viên mới hoặc gia hạn
const getNewMembersStats = async (req, res) => {
    try {
        const count = await membershipModel.countDocuments();
        const recent = await membershipModel.find().sort({ createdAt: -1 }).limit(10).populate("user");
        res.json({ success: true, total: count, recent });
    } catch {
        res.json({ success: false, message: "Error fetching stats" });
    }
};

// Hiệu suất nhân viên (số lượt được feedback tốt)
const getStaffPerformance = async (req, res) => {
    try {
        const feedbacks = await feedbackModel.find({ target: "STAFF" });
        const map = {};
        for (let f of feedbacks) {
            const id = f.relatedUser?.toString();
            if (id) {
                if (!map[id]) map[id] = { total: 0, sum: 0 };
                map[id].total += 1;
                map[id].sum += f.rating;
            }
        }
        res.json({ success: true, stats: map });
    } catch {
        res.json({ success: false, message: "Error calculating staff performance" });
    }
};

export { getRevenue, getNewMembersStats, getStaffPerformance };
