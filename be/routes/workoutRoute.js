import express from "express";
import { logWorkout, getWorkoutByUser } from "../controllers/workoutController.js";
import authMiddleware from "../middleware/auth.js";

const workoutRouter = express.Router();

workoutRouter.post("/", authMiddleware, logWorkout);
workoutRouter.get("/user/:userId", authMiddleware, getWorkoutByUser);

export default workoutRouter;
