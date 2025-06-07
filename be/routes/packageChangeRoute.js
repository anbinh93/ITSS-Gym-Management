import express from "express";
import {
    requestPackageChange,
    approvePackageChange,
    getPackageChangesByUser,
    getAllPackageChanges
} from "../controllers/packageChangeController.js";
import authMiddleware from "../middleware/auth.js";

const packageChangeRouter = express.Router();

// User routes
packageChangeRouter.post("/request", authMiddleware, requestPackageChange);
packageChangeRouter.get("/user/:userId", authMiddleware, getPackageChangesByUser);

// Admin/Staff routes
packageChangeRouter.patch("/:changeId/approve", authMiddleware, approvePackageChange);
packageChangeRouter.get("/all", authMiddleware, getAllPackageChanges);

export default packageChangeRouter;
