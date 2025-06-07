import { membershipModel } from "../models/membershipModel.js";
import { userModel } from "../models/userModel.js";
import { feedbackModel } from "../models/feedbackModel.js";

// Doanh thu với phân tích theo thời gian
const getRevenue = async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        
        // Lấy tất cả membership đã thanh toán
        const paidMemberships = await membershipModel.find({ paymentStatus: 'paid' }).populate("package");
        const totalRevenue = paidMemberships.reduce((sum, m) => sum + (m.package?.price || 0), 0);
        
        // Tính doanh thu theo thời gian
        const now = new Date();
        let timeSeriesData = [];
        
        if (period === 'day') {
            // Doanh thu 7 ngày gần nhất
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
                
                const dayRevenue = paidMemberships
                    .filter(m => m.createdAt >= dayStart && m.createdAt < dayEnd)
                    .reduce((sum, m) => sum + (m.package?.price || 0), 0);
                
                timeSeriesData.push({
                    name: date.toLocaleDateString('vi-VN'),
                    revenue: dayRevenue
                });
            }
        } else if (period === 'week') {
            // Doanh thu 4 tuần gần nhất
            for (let i = 3; i >= 0; i--) {
                const weekStart = new Date(now);
                weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i));
                weekStart.setHours(0, 0, 0, 0);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 7);
                
                const weekRevenue = paidMemberships
                    .filter(m => m.createdAt >= weekStart && m.createdAt < weekEnd)
                    .reduce((sum, m) => sum + (m.package?.price || 0), 0);
                
                timeSeriesData.push({
                    name: `Tuần ${4-i}`,
                    revenue: weekRevenue
                });
            }
        } else if (period === 'month') {
            // Doanh thu 6 tháng gần nhất
            for (let i = 5; i >= 0; i--) {
                const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
                
                const monthRevenue = paidMemberships
                    .filter(m => m.createdAt >= monthStart && m.createdAt < monthEnd)
                    .reduce((sum, m) => sum + (m.package?.price || 0), 0);
                
                timeSeriesData.push({
                    name: monthStart.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
                    revenue: monthRevenue
                });
            }
        } else if (period === 'quarter') {
            // Doanh thu 4 quý gần nhất
            for (let i = 3; i >= 0; i--) {
                const currentQuarter = Math.floor(now.getMonth() / 3);
                const quarterYear = now.getFullYear() - Math.floor(i / 4);
                const quarter = (currentQuarter - i % 4 + 4) % 4;
                
                const quarterStart = new Date(quarterYear, quarter * 3, 1);
                const quarterEnd = new Date(quarterYear, (quarter + 1) * 3, 1);
                
                const quarterRevenue = paidMemberships
                    .filter(m => m.createdAt >= quarterStart && m.createdAt < quarterEnd)
                    .reduce((sum, m) => sum + (m.package?.price || 0), 0);
                
                timeSeriesData.push({
                    name: `Q${quarter + 1} ${quarterYear}`,
                    revenue: quarterRevenue
                });
            }
        } else if (period === 'year') {
            // Doanh thu 3 năm gần nhất
            for (let i = 2; i >= 0; i--) {
                const year = now.getFullYear() - i;
                const yearStart = new Date(year, 0, 1);
                const yearEnd = new Date(year + 1, 0, 1);
                
                const yearRevenue = paidMemberships
                    .filter(m => m.createdAt >= yearStart && m.createdAt < yearEnd)
                    .reduce((sum, m) => sum + (m.package?.price || 0), 0);
                
                timeSeriesData.push({
                    name: `Năm ${year}`,
                    revenue: yearRevenue
                });
            }
        }
        
        res.json({ 
            success: true, 
            revenue: totalRevenue,
            timeSeriesData,
            period
        });
    } catch (error) {
        console.error('getRevenue error:', error);
        res.json({ success: false, message: "Error calculating revenue" });
    }
};

// Hội viên mới và thống kê chi tiết
const getNewMembersStats = async (req, res) => {
    try {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        // Tổng số membership
        const totalMemberships = await membershipModel.countDocuments();
        
        // Hội viên mới tháng này
        const newMembersThisMonth = await membershipModel.countDocuments({
            createdAt: { $gte: thisMonth }
        });
        
        // Hội viên gia hạn (membership mới của user đã có membership trước đó)
        const allMemberships = await membershipModel.find().populate('user');
        const userMembershipCounts = {};
        
        allMemberships.forEach(membership => {
            const userId = membership.user?._id?.toString();
            if (userId) {
                userMembershipCounts[userId] = (userMembershipCounts[userId] || 0) + 1;
            }
        });
        
        const renewals = Object.values(userMembershipCounts).filter(count => count > 1).length;
        
        // Ước tính buổi tập đã sử dụng (dựa trên số membership và thời gian)
        const activeMemberships = await membershipModel.find({ 
            paymentStatus: 'paid',
            endDate: { $gte: now }
        }).populate('package');
        
        const estimatedSessionsUsed = activeMemberships.reduce((total, membership) => {
            // Ước tính dựa trên loại gói và thời gian đã qua
            const sessionsPerMonth = membership.package?.sessionsPerMonth || 8; // default 8 sessions/month
            const monthsActive = Math.max(1, Math.floor((now - membership.createdAt) / (1000 * 60 * 60 * 24 * 30)));
            return total + Math.min(sessionsPerMonth * monthsActive, sessionsPerMonth * 3); // max 3 months
        }, 0);
        
        // Danh sách member gần đây
        const recentMemberships = await membershipModel
            .find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("user");
        
        res.json({ 
            success: true, 
            total: totalMemberships,
            newMembers: newMembersThisMonth,
            renewals: renewals,
            sessionsUsed: estimatedSessionsUsed,
            recent: recentMemberships
        });
    } catch (error) {
        console.error('getNewMembersStats error:', error);
        res.json({ success: false, message: "Error fetching stats" });
    }
};

// Hiệu suất nhân viên với thông tin chi tiết
const getStaffPerformance = async (req, res) => {
    try {
        const feedbacks = await feedbackModel.find({ target: "STAFF" }).populate('relatedUser');
        const staffPerformanceMap = {};
        
        for (let feedback of feedbacks) {
            const staffUser = feedback.relatedUser;
            if (staffUser) {
                const staffId = staffUser._id.toString();
                if (!staffPerformanceMap[staffId]) {
                    staffPerformanceMap[staffId] = { 
                        name: staffUser.name || staffUser.username || `Staff ${staffId.slice(-4)}`,
                        email: staffUser.email,
                        total: 0, 
                        sum: 0,
                        ratings: []
                    };
                }
                staffPerformanceMap[staffId].total += 1;
                staffPerformanceMap[staffId].sum += feedback.rating;
                staffPerformanceMap[staffId].ratings.push(feedback.rating);
            }
        }
        
        // Chuyển đổi thành array và tính average
        const staffPerformanceArray = Object.entries(staffPerformanceMap).map(([staffId, data]) => ({
            id: staffId,
            name: data.name,
            email: data.email,
            averageRating: data.total > 0 ? (data.sum / data.total) : 0,
            totalFeedbacks: data.total,
            ratings: data.ratings
        }));
        
        // Sắp xếp theo rating trung bình
        staffPerformanceArray.sort((a, b) => b.averageRating - a.averageRating);
        
        res.json({ 
            success: true, 
            stats: staffPerformanceMap, // Giữ format cũ cho backward compatibility
            staffPerformance: staffPerformanceArray // Format mới dễ sử dụng hơn
        });
    } catch (error) {
        console.error('getStaffPerformance error:', error);
        res.json({ success: false, message: "Error calculating staff performance" });
    }
};

export { getRevenue, getNewMembersStats, getStaffPerformance };
