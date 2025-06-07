import { membershipModel } from "../models/membershipModel.js";
import { packageModel } from "../models/packageModel.js";

// Đăng ký gói tập mới cho hội viên
const registerMembership = async (req, res) => {
    const { userId, packageId, paymentStatus, coach } = req.body;

    try {
        const packageInfo = await packageModel.findById(packageId);
        if (!packageInfo) return res.json({ success: false, message: "Package not found" });

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + packageInfo.durationInDays);

        const sessionsRemaining = packageInfo.sessionLimit || null;

        const newMembership = await membershipModel.create({
            user: userId,
            coach: coach || undefined,
            package: packageId,
            startDate,
            endDate,
            sessionsRemaining,
            isActive: true,
            paymentStatus: paymentStatus || 'unpaid',
        });

        res.json({ success: true, membership: newMembership });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error registering membership" });
    }
};

// Lấy tất cả membership của 1 user
const getMembershipsByUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const memberships = await membershipModel.find({ user: userId })
            .populate("package")
            .populate("coach", "name email");
        res.json({ success: true, memberships });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error fetching memberships" });
    }
};

// Lấy tất cả membership (admin dashboard)
const getAllMemberships = async (req, res) => {
    try {
        const filter = {};
        if (req.query.coach) {
            filter.coach = req.query.coach;
        }
        const memberships = await membershipModel.find(filter).populate('user').populate('package').populate('coach');
        res.json({ success: true, memberships });
    } catch (err) {
        res.json({ success: false, message: 'Error fetching all memberships' });
    }
};

// Cập nhật trạng thái thanh toán
const updatePaymentStatus = async (req, res) => {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    if (!['paid', 'unpaid'].includes(paymentStatus)) {
        return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }
    try {
        const updated = await membershipModel.findByIdAndUpdate(id, { paymentStatus }, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Membership not found' });
        res.json({ success: true, membership: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error updating payment status' });
    }
};

// Lấy membership active của user
const getActiveMembership = async (req, res) => {
    const { userId } = req.params;
    try {
        const now = new Date();
        const memberships = await membershipModel.find({
            user: userId,
            paymentStatus: 'paid',
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).populate("package").populate("coach", "name email");
        res.json({ success: true, memberships });
    } catch (err) {
        res.json({ success: false, message: "Error fetching active membership" });
    }
};

// Cập nhật coach cho membership
const updateCoach = async (req, res) => {
    const { id } = req.params;
    const { coach } = req.body;
    try {
        const updated = await membershipModel.findByIdAndUpdate(id, { coach }, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Membership not found' });
        res.json({ success: true, membership: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error updating coach' });
    }
};

// Cập nhật trạng thái học viên (status)
const updateMembershipStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }
    try {
        const updated = await membershipModel.findByIdAndUpdate(id, { status }, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Membership not found' });
        res.json({ success: true, membership: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error updating status' });
    }
};

export {
    registerMembership,
    getMembershipsByUser,
    getAllMemberships,
    updatePaymentStatus,
    getActiveMembership,
    updateCoach,
    updateMembershipStatus
};
