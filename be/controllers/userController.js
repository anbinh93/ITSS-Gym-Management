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
    const { name, email, password, phone, birthYear, role, gender } = req.body;
    try {
        const exists = await userModel.findOne({ email });
        if (exists) return res.json({ success: false, message: "User already exists" });

        if (!validator.isEmail(email)) return res.json({ success: false, message: "Invalid email" });
        if (password.length < 8) return res.json({ success: false, message: "Password too short" });

        const hashed = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            name, email, password: hashed, phone, birthYear, role, gender
        });

        const token = createToken(user._id);
        res.json({ success: true, token });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error" });
    }
};

// Đăng nhập
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.json({ success: false, message: "User doesn't exist" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

        const token = createToken(user._id);
        res.json({ success: true, token });
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

export {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById
};
