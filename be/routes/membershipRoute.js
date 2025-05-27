import express from "express";
import {
    registerMembership,
    getMembershipsByUser
} from "../controllers/membershipController.js";
import authMiddleware from "../middleware/auth.js";

const membershipRouter = express.Router();

membershipRouter.post("/", authMiddleware, registerMembership);
membershipRouter.get("/user/:userId", authMiddleware, getMembershipsByUser);

export default membershipRouter;
