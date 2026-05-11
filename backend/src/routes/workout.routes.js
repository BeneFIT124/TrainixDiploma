import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  addWorkoutItem,
  getWorkoutItems,
  updateWorkoutItem,
  deleteWorkoutItem,
} from "../controllers/workout.controller.js";

const router = express.Router();

router.post("/", protect, createWorkout);
router.get("/", protect, getWorkouts);
router.get("/:id", protect, getWorkoutById);
router.put("/:id", protect, updateWorkout);
router.delete("/:id", protect, deleteWorkout);

router.post("/:workoutId/items", protect, addWorkoutItem);
router.get("/:workoutId/items", protect, getWorkoutItems);
router.put("/:workoutId/items/:itemId", protect, updateWorkoutItem);
router.delete("/:workoutId/items/:itemId", protect, deleteWorkoutItem);

export default router;