import express from "express";
import {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    getCurrentUser,
    checkAccount,
    updateUser,
    deleteUser
} from "../controllers/userController.js";

import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/", authMiddleware, getAllUsers);
userRouter.get("/:id", authMiddleware, getUserById);
userRouter.get("/me", authMiddleware, getCurrentUser);
userRouter.get("/check", checkAccount);
userRouter.put("/:id", authMiddleware, updateUser);
userRouter.delete("/:id", authMiddleware, deleteUser);

export default userRouter;
