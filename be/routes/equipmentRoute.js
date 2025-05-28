import express from "express";
import {
    addEquipment,
    getAllEquipment,
    updateEquipment,
    deleteEquipment
} from "../controllers/equipmentController.js";
import authMiddleware from "../middleware/auth.js";

const equipmentRouter = express.Router();

equipmentRouter.post("/", authMiddleware, addEquipment);
equipmentRouter.get("/", getAllEquipment);
equipmentRouter.put("/:id", authMiddleware, updateEquipment);
equipmentRouter.delete("/:id", authMiddleware, deleteEquipment);

export default equipmentRouter;
