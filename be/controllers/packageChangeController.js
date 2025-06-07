import { membershipModel } from "../models/membershipModel.js";
import { packageModel } from "../models/packageModel.js";
import { packageChangeModel } from "../models/packageChangeModel.js";

// Yêu cầu đổi gói tập
const requestPackageChange = async (req, res) => {
    const { membershipId, newPackageId, reason } = req.body;

    try {
        // Validate membership exists
        const membership = await membershipModel.findById(membershipId)
            .populate('package')
            .populate('user');
        if (!membership) {
            return res.status(404).json({ success: false, message: "Membership không tồn tại" });
        }

        // Validate new package exists
        const newPackage = await packageModel.findById(newPackageId);
        if (!newPackage) {
            return res.status(404).json({ success: false, message: "Gói tập mới không tồn tại" });
        }

        // Check if membership is active
        if (membership.paymentStatus !== 'paid' || new Date() > new Date(membership.endDate)) {
            return res.status(400).json({ 
                success: false, 
                message: "Chỉ có thể đổi gói tập khi membership đang hoạt động" 
            });
        }

        // Calculate price difference
        const priceDifference = newPackage.price - membership.package.price;
        
        // Calculate remaining days
        const today = new Date();
        const endDate = new Date(membership.endDate);
        const remainingDays = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

        // Calculate prorated amounts
        const totalDays = membership.package.durationInDays;
        const usedDays = totalDays - remainingDays;
        const usedAmount = (membership.package.price / totalDays) * usedDays;
        const refundAmount = membership.package.price - usedAmount;
        
        // New package cost for remaining period
        const newPeriodCost = (newPackage.price / newPackage.durationInDays) * remainingDays;
        const netAmount = newPeriodCost - refundAmount;

        // Create package change request
        const packageChange = await packageChangeModel.create({
            membership: membershipId,
            user: membership.user._id,
            oldPackage: membership.package._id,
            newPackage: newPackageId,
            requestDate: new Date(),
            reason,
            status: 'pending',
            priceDifference,
            remainingDays,
            refundAmount,
            newPeriodCost,
            netAmount,
            oldSessionsRemaining: membership.sessionsRemaining,
            newSessionsCalculated: Math.floor((membership.sessionsRemaining / membership.package.sessionLimit) * newPackage.sessionLimit)
        });

        res.json({ 
            success: true, 
            packageChange,
            message: "Yêu cầu đổi gói tập đã được tạo thành công" 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Lỗi tạo yêu cầu đổi gói tập" });
    }
};

// Phê duyệt đổi gói tập (Admin/Staff)
const approvePackageChange = async (req, res) => {
    const { changeId } = req.params;
    const { approved, adminNote } = req.body;

    try {
        const packageChange = await packageChangeModel.findById(changeId)
            .populate('membership')
            .populate('newPackage');

        if (!packageChange) {
            return res.status(404).json({ success: false, message: "Yêu cầu đổi gói không tồn tại" });
        }

        if (packageChange.status !== 'pending') {
            return res.status(400).json({ success: false, message: "Yêu cầu đã được xử lý" });
        }

        if (approved) {
            // Update membership với gói mới
            const membership = await membershipModel.findById(packageChange.membership._id);
            const newEndDate = new Date();
            newEndDate.setDate(newEndDate.getDate() + packageChange.remainingDays);

            await membershipModel.findByIdAndUpdate(packageChange.membership._id, {
                package: packageChange.newPackage._id,
                endDate: newEndDate,
                sessionsRemaining: packageChange.newSessionsCalculated,
                // Nếu cần thanh toán thêm, đặt paymentStatus về unpaid
                paymentStatus: packageChange.netAmount > 0 ? 'unpaid' : 'paid'
            });

            // Update package change status
            await packageChangeModel.findByIdAndUpdate(changeId, {
                status: 'approved',
                approvedDate: new Date(),
                adminNote,
                processedBy: req.user.userId // từ auth middleware
            });

            res.json({ 
                success: true, 
                message: "Đã phê duyệt đổi gói tập thành công" 
            });
        } else {
            // Reject package change
            await packageChangeModel.findByIdAndUpdate(changeId, {
                status: 'rejected',
                rejectedDate: new Date(),
                adminNote,
                processedBy: req.user.userId
            });

            res.json({ 
                success: true, 
                message: "Đã từ chối yêu cầu đổi gói tập" 
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Lỗi xử lý yêu cầu đổi gói tập" });
    }
};

// Lấy danh sách yêu cầu đổi gói của user
const getPackageChangesByUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const packageChanges = await packageChangeModel.find({ user: userId })
            .populate('oldPackage')
            .populate('newPackage')
            .populate('membership')
            .sort({ createdAt: -1 });

        res.json({ success: true, packageChanges });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách yêu cầu đổi gói" });
    }
};

// Lấy tất cả yêu cầu đổi gói (Admin)
const getAllPackageChanges = async (req, res) => {
    try {
        const packageChanges = await packageChangeModel.find()
            .populate('user', 'name email')
            .populate('oldPackage')
            .populate('newPackage')
            .populate('membership')
            .populate('processedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, packageChanges });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách yêu cầu đổi gói" });
    }
};

export {
    requestPackageChange,
    approvePackageChange,
    getPackageChangesByUser,
    getAllPackageChanges
};
