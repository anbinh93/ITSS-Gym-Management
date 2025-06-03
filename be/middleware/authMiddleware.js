import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from headers - support multiple formats
        let token = req.headers.token;
        
        // Check Authorization header (Bearer format)
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        // Check lowercase authorization header
        if (!token && req.headers.Authorization) {
            const authHeader = req.headers.Authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return res.json({ 
                success: false, 
                message: "Cần đăng nhập để truy cập chức năng này" 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user in database to get full user info
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.json({ 
                success: false, 
                message: "Tài khoản không tồn tại hoặc đã bị xóa" 
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.json({ 
                success: false, 
                message: "Tài khoản đã bị tạm khóa" 
            });
        }

        // Add user info to request object
        req.user = {
            id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            fullUser: user // Full user object for complex operations
        };

        // Keep backward compatibility
        if (!req.body) {
            req.body = {};
        }
        req.body.userId = user._id;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.json({ 
                success: false, 
                message: "Token không hợp lệ" 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.json({ 
                success: false, 
                message: "Token đã hết hạn, vui lòng đăng nhập lại" 
            });
        }

        return res.json({ 
            success: false, 
            message: "Lỗi xác thực, vui lòng thử lại" 
        });
    }
};

export default authMiddleware;