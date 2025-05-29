import express from "express";
import { getAllGymRooms, createGymRoom, updateGymRoom, deleteGymRoom } from "../controllers/gymRoomController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllGymRooms);
router.post("/", authMiddleware, createGymRoom);
router.put("/:id", authMiddleware, updateGymRoom);
router.delete("/:id", authMiddleware, deleteGymRoom);

export default router; 