import express from "express";
import {
    createPackage,
    getAllPackages,
    getPackageById,
    updatePackage,
    deletePackage
} from "../controllers/packageController.js";
import authMiddleware from "../middleware/auth.js";

const packageRouter = express.Router();

packageRouter.post("/", authMiddleware, createPackage);
packageRouter.get("/", getAllPackages);
packageRouter.get("/:id", getPackageById);
packageRouter.put("/:id", authMiddleware, updatePackage);
packageRouter.delete("/:id", authMiddleware, deletePackage);

export default packageRouter;
