import { feedbackModel } from "../models/feedbackModel.js";
import { userModel } from "../models/userModel.js";

// Gửi phản hồi từ khách hàng
const submitFeedback = async (req, res) => {
    try {
        const { rating, message, target, relatedUser } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!rating || !target) {
            return res.status(400).json({
                success: false,
                message: "Rating và target là bắt buộc"
            });
        }

        const feedback = await feedbackModel.create({
            user: userId,
            rating,
            message: message || "",
            target,
            relatedUser,
            status: "PENDING" // Mặc định là chờ xử lý
        });

        await feedback.populate([
            { path: 'user', select: 'name email' },
            { path: 'relatedUser', select: 'name email' }
        ]);

        res.status(201).json({
            success: true,
            feedback
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi gửi phản hồi",
            error: error.message
        });
    }
};

// Admin: Lấy danh sách phản hồi với filter
const getFeedbacksByTarget = async (req, res) => {
    try {
        const { target } = req.params;
        const { page = 1, limit = 10, sort = '-createdAt', status } = req.query;

        // Build query
        const query = { target };
        if (status) {
            query.status = status;
        }

        // Tính toán phân trang
        const skip = (page - 1) * limit;

        // Query với populate và phân trang
        const [feedbacks, total] = await Promise.all([
            feedbackModel.find(query)
                .populate('user', 'name email')
                .populate('relatedUser', 'name email')
                .populate('adminResponse.updatedBy', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            feedbackModel.countDocuments(query)
        ]);

        // Tính toán thống kê
        const stats = await feedbackModel.aggregate([
            { $match: { target } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalFeedbacks: { $sum: 1 },
                    statusDistribution: {
                        $push: "$status"
                    }
                }
            }
        ]);

        // Tính phân phối status
        const statusDistribution = stats[0]?.statusDistribution.reduce((acc, status) => {
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {}) || {};

        res.json({
            success: true,
            feedbacks,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            stats: {
                averageRating: stats[0]?.averageRating || 0,
                totalFeedbacks: stats[0]?.totalFeedbacks || 0,
                statusDistribution
            }
        });
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách phản hồi",
            error: error.message
        });
    }
};

// Admin: Lấy chi tiết một phản hồi
const getFeedbackDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        const feedback = await feedbackModel.findById(id)
            .populate('user', 'name email')
            .populate('relatedUser', 'name email')
            .populate('adminResponse.updatedBy', 'name email');

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy phản hồi"
            });
        }

        res.json({
            success: true,
            feedback
        });
    } catch (error) {
        console.error('Error fetching feedback detail:', error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy chi tiết phản hồi",
            error: error.message
        });
    }
};

// Admin: Cập nhật trạng thái và phản hồi
const updateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminResponse } = req.body;
        const adminId = req.user._id;

        // Validate status
        const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Trạng thái không hợp lệ"
            });
        }

        const feedback = await feedbackModel.findById(id);
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy phản hồi"
            });
        }

        // Cập nhật trạng thái và phản hồi của admin
        feedback.status = status;
        if (adminResponse) {
            feedback.adminResponse = {
                message: adminResponse,
                updatedAt: new Date(),
                updatedBy: adminId
            };
        }

        await feedback.save();

        // Populate thông tin trước khi trả về
        await feedback.populate([
            { path: 'user', select: 'name email' },
            { path: 'relatedUser', select: 'name email' },
            { path: 'adminResponse.updatedBy', select: 'name email' }
        ]);

        res.json({
            success: true,
            feedback
        });
    } catch (error) {
        console.error('Error updating feedback status:', error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật trạng thái phản hồi",
            error: error.message
        });
    }
};

// User: Lấy phản hồi của user hiện tại
const getUserFeedbacks = async (req, res) => {
    try {
        const userId = req.user._id;
        const feedbacks = await feedbackModel.find({ user: userId })
            .populate('relatedUser', 'name email')
            .populate('adminResponse.updatedBy', 'name email')
            .sort('-createdAt');

        res.json({
            success: true,
            feedbacks
        });
    } catch (error) {
        console.error('Error fetching user feedbacks:', error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy phản hồi của người dùng",
            error: error.message
        });
    }
};

export {
    submitFeedback,
    getFeedbacksByTarget,
    getUserFeedbacks,
    getFeedbackDetail,
    updateFeedbackStatus
};
