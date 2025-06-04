import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getProgressByUser, updateProgressByUser } from "../controllers/progressController.js";

const router = express.Router();

router.get("/user/:userId", authMiddleware, getProgressByUser);
router.put("/user/:userId", authMiddleware, updateProgressByUser);

export default router; 