import express from "express";
import {
    registerMembership,
    getMembershipsByUser,
    getAllMemberships,
    updatePaymentStatus,
    getActiveMembership
} from "../controllers/membershipController.js";
import authMiddleware from "../middleware/auth.js";

const membershipRouter = express.Router();

membershipRouter.post("/", authMiddleware, registerMembership);
membershipRouter.get("/user/:userId", authMiddleware, getMembershipsByUser);
membershipRouter.get("/all", authMiddleware, getAllMemberships);
membershipRouter.patch("/:id/payment-status", authMiddleware, updatePaymentStatus);
membershipRouter.get("/active/:userId", authMiddleware, getActiveMembership);

export default membershipRouter;
