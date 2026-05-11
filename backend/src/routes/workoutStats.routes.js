import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getWeeklyWorkoutSummary,
  getExerciseProgress,
} from "../controllers/workoutStats.controller.js";

const router = express.Router();

router.get("/summary/weekly", protect, getWeeklyWorkoutSummary);
router.get("/exercise-progress/:exerciseId", protect, getExerciseProgress);

export default router;