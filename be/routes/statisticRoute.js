import express from "express";
import {
    getRevenue,
    getNewMembersStats,
    getStaffPerformance
} from "../controllers/statisticController.js";
import authMiddleware from "../middleware/auth.js";

const statisticRouter = express.Router();

statisticRouter.get("/revenue", authMiddleware, getRevenue);
statisticRouter.get("/new-members", authMiddleware, getNewMembersStats);
statisticRouter.get("/staff-performance", authMiddleware, getStaffPerformance);

export default statisticRouter;
