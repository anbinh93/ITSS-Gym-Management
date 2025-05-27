import { membershipModel } from "../models/membershipModel.js";
import { packageModel } from "../models/packageModel.js";

// Đăng ký gói tập mới cho hội viên
const registerMembership = async (req, res) => {
    const { userId, packageId } = req.body;

    try {
        const packageInfo = await packageModel.findById(packageId);
        if (!packageInfo) return res.json({ success: false, message: "Package not found" });

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + packageInfo.durationInDays);

        const sessionsRemaining = packageInfo.sessionLimit || null;

        const newMembership = await membershipModel.create({
            user: userId,
            package: packageId,
            startDate,
            endDate,
            sessionsRemaining,
            isActive: true,
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
            .populate("package");
        res.json({ success: true, memberships });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error fetching memberships" });
    }
};

export {
    registerMembership,
    getMembershipsByUser
};
