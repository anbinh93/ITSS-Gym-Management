import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    // Get token from headers - support both formats
    let token = req.headers.token;
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) {
        return res.json({ success: false, message: "Not Authorized Login Again" });
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ensure req.body exists
        if (!req.body) {
            req.body = {};
        }
        // Chỉ gán userId nếu chưa có (user tự đăng ký), nếu đã có thì giữ nguyên (admin đăng ký hộ)
        if (!req.body.userId) {
            req.body.userId = token_decode.id;
        }
        req.user = { id: token_decode.id };
        next();
    } catch (error) {
        return res.json({ success: false, message: "Not Authorized Login Again" });
    }
};

export default authMiddleware;