import { membershipModel } from "../models/membershipModel.js";
import { userModel } from "../models/userModel.js";
import { feedbackModel } from "../models/feedbackModel.js";

// Doanh thu cơ bản (tổng tiền từ các gói đã mua)
const getRevenue = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};
        
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const data = await membershipModel.find(query)
            .populate("package")
            .populate("user");

        // Tính doanh thu theo từng gói
        const revenueByPackage = {};
        let totalRevenue = 0;

        data.forEach(membership => {
            if (membership.package) {
                const packageId = membership.package._id.toString();
                if (!revenueByPackage[packageId]) {
                    revenueByPackage[packageId] = {
                        packageName: membership.package.name,
                        revenue: 0,
                        count: 0
                    };
                }
                revenueByPackage[packageId].revenue += membership.package.price;
                revenueByPackage[packageId].count += 1;
                totalRevenue += membership.package.price;
            }
        });

        res.json({ 
            success: true, 
            totalRevenue,
            revenueByPackage: Object.values(revenueByPackage)
        });
    } catch (error) {
        res.json({ success: false, message: "Error calculating revenue", error: error.message });
    }
};

// Hội viên mới hoặc gia hạn
const getNewMembersStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};
        
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Lấy tổng số hội viên
        const totalMembers = await membershipModel.countDocuments(query);

        // Lấy hội viên mới (lần đầu đăng ký)
        const newMembers = await membershipModel.aggregate([
            { $match: query },
            { $group: { _id: "$user", firstPurchase: { $min: "$createdAt" } } },
            { $match: { firstPurchase: { $gte: new Date(startDate), $lte: new Date(endDate) } } }
        ]);

        // Lấy hội viên gia hạn
        const renewedMembers = await membershipModel.aggregate([
            { $match: query },
            { $group: { _id: "$user", purchaseCount: { $sum: 1 } } },
            { $match: { purchaseCount: { $gt: 1 } } }
        ]);

        // Lấy 10 membership gần nhất với thông tin chi tiết
        const recent = await membershipModel.find(query)
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("user")
            .populate("package");

        res.json({ 
            success: true, 
            total: totalMembers,
            newMembers: newMembers.length,
            renewedMembers: renewedMembers.length,
            recent 
        });
    } catch (error) {
        res.json({ success: false, message: "Error fetching stats", error: error.message });
    }
};

// Hiệu suất nhân viên (số lượt được feedback tốt)
const getStaffPerformance = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = { target: "STAFF" };
        
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const feedbacks = await feedbackModel.find(query)
            .populate("relatedUser", "name email");

        const staffStats = {};
        
        for (let f of feedbacks) {
            const staffId = f.relatedUser?._id.toString();
            if (staffId) {
                if (!staffStats[staffId]) {
                    staffStats[staffId] = {
                        staffName: f.relatedUser.name,
                        total: 0,
                        sum: 0,
                        average: 0
                    };
                }
                staffStats[staffId].total += 1;
                staffStats[staffId].sum += f.rating;
                staffStats[staffId].average = staffStats[staffId].sum / staffStats[staffId].total;
            }
        }

        // Sắp xếp theo rating trung bình
        const sortedStats = Object.values(staffStats).sort((a, b) => b.average - a.average);

        res.json({ 
            success: true, 
            stats: sortedStats
        });
    } catch (error) {
        res.json({ success: false, message: "Error calculating staff performance", error: error.message });
    }
};

export { getRevenue, getNewMembersStats, getStaffPerformance };
