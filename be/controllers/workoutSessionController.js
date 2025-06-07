import { workoutSessionModel } from "../models/workoutSessionModel.js";
import { membershipModel } from "../models/membershipModel.js";
import { userModel } from "../models/userModel.js";

// Tạo workout session (user tự ghi nhận hoặc coach ghi nhận)
export const createWorkoutSession = async (req, res) => {
  try {
    const { membershipId, workoutDate, startTime, endTime, exerciseName, notes, coachId } = req.body;
    
    // Kiểm tra membership có tồn tại và thuộc về user
    const membership = await membershipModel.findById(membershipId).populate('user');
    if (!membership) {
      return res.status(404).json({ success: false, message: "Membership không tồn tại" });
    }
    
    // Kiểm tra quyền: user chỉ được tạo session cho membership của mình
    if (req.user.role === 'user' && membership.user._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Không có quyền" });
    }
    
    // Tạo workout session
    const workoutSession = await workoutSessionModel.create({
      user: membership.user._id,
      membership: membershipId,
      coach: coachId || membership.coach,
      workoutDate: new Date(workoutDate),
      startTime,
      endTime,
      exerciseName,
      notes,
      isConfirmed: req.user.role === 'coach' || req.user.role === 'staff', // Coach/Staff auto confirm
      confirmedBy: (req.user.role === 'coach' || req.user.role === 'staff') ? req.user.id : null,
      confirmedAt: (req.user.role === 'coach' || req.user.role === 'staff') ? new Date() : null
    });

    // Giảm số buổi còn lại nếu session được xác nhận
    if (workoutSession.isConfirmed && membership.sessionsRemaining > 0) {
      membership.sessionsRemaining = Math.max(0, membership.sessionsRemaining - 1);
      await membership.save();
    }

    const populatedSession = await workoutSessionModel.findById(workoutSession._id)
      .populate('user', 'name email')
      .populate('coach', 'name email')
      .populate('membership', 'package sessionsRemaining');

    res.status(201).json({ success: true, workoutSession: populatedSession });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Lấy danh sách workout sessions của user
export const getUserWorkoutSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    // Kiểm tra quyền truy cập
    if (req.user.role === 'user' && req.user.id.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Không có quyền" });
    }
    
    const filter = { user: userId };
    
    // Lọc theo ngày nếu có
    if (startDate && endDate) {
      filter.workoutDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const sessions = await workoutSessionModel.find(filter)
      .populate('coach', 'name email')
      .populate('membership', 'package sessionsRemaining')
      .sort({ workoutDate: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await workoutSessionModel.countDocuments(filter);
    
    res.json({ 
      success: true, 
      workoutSessions: sessions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Xác nhận workout session (chỉ coach hoặc staff)
export const confirmWorkoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Chỉ coach hoặc staff mới có thể xác nhận
    if (!['coach', 'staff', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Không có quyền xác nhận" });
    }
    
    const session = await workoutSessionModel.findById(sessionId).populate('membership');
    if (!session) {
      return res.status(404).json({ success: false, message: "Session không tồn tại" });
    }
    
    if (session.isConfirmed) {
      return res.status(400).json({ success: false, message: "Session đã được xác nhận" });
    }
    
    // Nếu là coach, kiểm tra xem có phải coach phụ trách không
    if (req.user.role === 'coach' && session.coach && session.coach.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Chỉ coach phụ trách mới có thể xác nhận" });
    }
    
    // Xác nhận session
    session.isConfirmed = true;
    session.confirmedBy = req.user.id;
    session.confirmedAt = new Date();
    await session.save();
    
    // Giảm số buổi còn lại
    const membership = session.membership;
    if (membership.sessionsRemaining > 0) {
      membership.sessionsRemaining = Math.max(0, membership.sessionsRemaining - 1);
      await membership.save();
    }
    
    const populatedSession = await workoutSessionModel.findById(sessionId)
      .populate('user', 'name email')
      .populate('coach', 'name email')
      .populate('confirmedBy', 'name email')
      .populate('membership', 'package sessionsRemaining');
    
    res.json({ success: true, workoutSession: populatedSession });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Lấy thống kê tiến độ workout của user
export const getUserWorkoutProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const { membershipId } = req.query;
    
    // Kiểm tra quyền truy cập
    if (req.user.role === 'user' && req.user.id !== userId) {
      return res.status(403).json({ success: false, message: "Không có quyền" });
    }
    
    const filter = { user: userId, isConfirmed: true };
    if (membershipId) {
      filter.membership = membershipId;
    }
    
    // Lấy membership hiện tại
    const currentMembership = await membershipModel.findOne({
      user: userId,
      isActive: true,
      paymentStatus: 'paid',
      endDate: { $gte: new Date() }
    }).populate('package');
    
    if (!currentMembership) {
      return res.json({ 
        success: true, 
        progress: { 
          completionPercentage: 0, 
          sessionsCompleted: 0, 
          totalSessions: 0,
          sessionsRemaining: 0 
        }
      });
    }
    
    // Đếm số buổi đã hoàn thành cho membership hiện tại
    const sessionsCompleted = await workoutSessionModel.countDocuments({
      membership: currentMembership._id,
      isConfirmed: true
    });
    
    const totalSessions = currentMembership.package.sessionLimit || 0;
    const sessionsRemaining = currentMembership.sessionsRemaining || 0;
    const completionPercentage = totalSessions > 0 ? 
      Math.round((sessionsCompleted / totalSessions) * 100) : 0;
    
    res.json({ 
      success: true, 
      progress: {
        completionPercentage,
        sessionsCompleted,
        totalSessions,
        sessionsRemaining,
        membership: currentMembership
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Lấy các workout sessions cần xác nhận (cho coach)
export const getPendingWorkoutSessions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Chỉ coach hoặc staff mới có thể xem
    if (!['coach', 'staff', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Không có quyền" });
    }
    
    let filter = { isConfirmed: false };
    
    // Nếu là coach, chỉ xem sessions của học viên mình phụ trách
    if (req.user.role === 'coach') {
      filter.coach = req.user.id;
    }
    
    const sessions = await workoutSessionModel.find(filter)
      .populate('user', 'name email')
      .populate('coach', 'name email')
      .populate('membership', 'package sessionsRemaining')
      .sort({ workoutDate: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await workoutSessionModel.countDocuments(filter);
    
    res.json({ 
      success: true, 
      sessions: sessions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Lấy workout sessions theo membership ID
export const getSessionsByMembership = async (req, res) => {
  try {
    const { membershipId } = req.params;
    
    // Kiểm tra membership có tồn tại
    const membership = await membershipModel.findById(membershipId).populate('user');
    if (!membership) {
      return res.status(404).json({ success: false, message: "Không tìm thấy gói tập" });
    }
    
    // Kiểm tra quyền: user chỉ xem session của mình, coach xem của học viên mình phụ trách
    if (req.user.role === 'user' && membership.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập" });
    }
    
    if (req.user.role === 'coach' && membership.coach && membership.coach.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập" });
    }
    
    const sessions = await workoutSessionModel.find({ membership: membershipId })
      .populate('user', 'name email')
      .populate('coach', 'name email')
      .populate('confirmedBy', 'name email')
      .sort({ workoutDate: -1, createdAt: -1 });
    
    res.json({ 
      success: true, 
      sessions,
      membership: {
        _id: membership._id,
        package: membership.package,
        sessionsRemaining: membership.sessionsRemaining,
        user: membership.user
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// User check-in buổi tập
export const checkInWorkoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await workoutSessionModel.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session không tồn tại" });
    }
    
    // Kiểm tra quyền: user chỉ được check-in session của mình
    if (req.user.role === 'user' && session.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Không có quyền" });
    }
    
    // Kiểm tra trạng thái session
    if (session.status !== 'scheduled') {
      return res.status(400).json({ success: false, message: "Session đã được check-in hoặc đã hoàn thành" });
    }
    
    // Cập nhật status check-in
    session.status = 'checked_in';
    session.checkedInAt = new Date();
    session.checkedInBy = req.user.id;
    await session.save();
    
    const populatedSession = await workoutSessionModel.findById(session._id)
      .populate('user', 'name email')
      .populate('coach', 'name email')
      .populate('membership', 'package sessionsRemaining');
    
    res.json({ success: true, workoutSession: populatedSession });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// HLV check-out buổi tập (hoàn thành)
export const checkOutWorkoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { notes } = req.body;
    
    const session = await workoutSessionModel.findById(sessionId).populate('membership');
    if (!session) {
      return res.status(404).json({ success: false, message: "Session không tồn tại" });
    }
    
    // Chỉ coach/staff mới được check-out
    if (!['coach', 'staff', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Chỉ HLV/Staff mới có thể check-out" });
    }
    
    // Kiểm tra trạng thái session
    if (session.status !== 'checked_in') {
      return res.status(400).json({ success: false, message: "User chưa check-in hoặc session đã hoàn thành" });
    }
    
    // Cập nhật status check-out
    session.status = 'completed';
    session.checkedOutAt = new Date();
    session.checkedOutBy = req.user.id;
    if (notes) session.notes = notes;
    await session.save();
    
    // Giảm số buổi còn lại trong membership nếu chưa giảm
    const membership = session.membership;
    if (membership.sessionsRemaining > 0) {
      membership.sessionsRemaining = Math.max(0, membership.sessionsRemaining - 1);
      await membership.save();
    }
    
    const populatedSession = await workoutSessionModel.findById(session._id)
      .populate('user', 'name email')
      .populate('coach', 'name email')
      .populate('membership', 'package sessionsRemaining');
    
    res.json({ success: true, workoutSession: populatedSession });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Lấy thống kê số buổi tập cho progress
export const getWorkoutStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Kiểm tra quyền truy cập
    if (req.user.role === 'user' && req.user.id.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Không có quyền" });
    }
    
    // Lấy membership hiện tại
    const activeMembership = await membershipModel.findOne({
      user: userId,
      paymentStatus: 'paid',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).populate('package');
    
    if (!activeMembership) {
      return res.json({ 
        success: true, 
        stats: { 
          completedSessions: 0, 
          totalSessions: 0,
          remainingSessions: 0 
        } 
      });
    }
    
    // Đếm số buổi đã hoàn thành
    const completedSessions = await workoutSessionModel.countDocuments({
      user: userId,
      membership: activeMembership._id,
      status: 'completed'
    });
    
    // Tổng số buổi trong gói
    const totalSessions = activeMembership.package.sessionLimit || 0;
    
    res.json({ 
      success: true, 
      stats: { 
        completedSessions, 
        totalSessions,
        remainingSessions: activeMembership.sessionsRemaining
      } 
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
