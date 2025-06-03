import { userModel } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// Create JWT token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Đăng ký hội viên 
const registerUser = async (req, res) => {
    const { name, email, password, phone, birthYear, role, gender, username } = req.body;
    try {
        const exists = await userModel.findOne({ email });
        if (exists) return res.json({ success: false, message: "User already exists" });
        const usernameExists = await userModel.findOne({ username });
        if (usernameExists) return res.json({ success: false, message: "Username already exists" });

        if (!validator.isEmail(email)) return res.json({ success: false, message: "Invalid email" });
        if (password.length < 8) return res.json({ success: false, message: "Password too short" });

        const hashed = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            name, email, password: hashed, phone, birthYear, role, gender, username
        });

        const token = createToken(user._id);
        // Trả về cả user (không gồm password) và token
        const userObj = user.toObject();
        delete userObj.password;
        res.json({ success: true, user: userObj, token });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error" });
    }
};

// Đăng nhập
const loginUser = async (req, res) => {
    const { emailOrUsername, password } = req.body;
    try {
        // Cho phép login bằng email hoặc username
        const user = await userModel.findOne({ $or: [ { email: emailOrUsername }, { username: emailOrUsername } ] });
        if (!user) return res.json({ success: false, message: "User doesn't exist" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

        const token = createToken(user._id);
        // Trả về cả user (không gồm password) và token
        const userObj = user.toObject();
        delete userObj.password;
        res.json({ success: true, user: userObj, token });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error" });
    }
};

// Lấy user hiện tại
const getCurrentUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select("-password");
        if (!user) return res.json({ success: false, message: "User not found" });
        res.json({ success: true, user });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error" });
    }
};

// Lấy danh sách tất cả người dùng
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find().select("-password");
        res.json({ success: true, users });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error" });
    }
};

// Lấy chi tiết 1 người dùng
const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await userModel.findById(id).select("-password");
        if (!user) return res.json({ success: false, message: "User not found" });
        res.json({ success: true, user });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error" });
    }
};

// Kiểm tra tài khoản đã tồn tại
const checkAccount = async (req, res) => {
  const { emailOrUsername } = req.query;
  try {
    const user = await userModel.findOne({ $or: [ { email: emailOrUsername }, { username: emailOrUsername } ] });
    if (user) return res.json({ exists: true });
    res.json({ exists: false });
  } catch (err) {
    res.json({ exists: false, error: true });
  }
};

// Cập nhật thông tin user
const updateUser = async (req, res) => {
    try {
        const user = await userModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, user });
    } catch (err) {
        res.status(400).json({ success: false, message: "Error", error: err.message });
    }
};

// Xóa user
const deleteUser = async (req, res) => {
    try {
        const user = await userModel.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: "Error", error: err.message });
    }
};

// Đăng ký user bởi admin
const registerUserByAdmin = async (req, res) => {
    const { name, email, password, phone, birthYear, role, gender, username } = req.body;
    try {
        // Kiểm tra quyền admin
        const adminUser = await userModel.findById(req.user.id);
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        // Kiểm tra trùng email/username
        if (await userModel.findOne({ email })) return res.json({ success: false, message: "Email already exists" });
        if (await userModel.findOne({ username })) return res.json({ success: false, message: "Username already exists" });
        if (!password || password.length < 8) return res.json({ success: false, message: "Password too short" });
        const hashed = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            name, email, password: hashed, phone, birthYear, role, gender, username
        });
        const userObj = user.toObject();
        delete userObj.password;
        res.status(201).json({ success: true, user: userObj });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    getCurrentUser,
    checkAccount,
    updateUser,
    deleteUser,
    registerUserByAdmin
};
