import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  addWorkoutSet,
  getWorkoutSets,
  updateWorkoutSet,
  deleteWorkoutSet,
} from "../controllers/workoutSet.controller.js";

const router = express.Router();

router.post("/:itemId/sets", protect, addWorkoutSet);
router.get("/:itemId/sets", protect, getWorkoutSets);
router.put("/:itemId/sets/:setId", protect, updateWorkoutSet);
router.delete("/:itemId/sets/:setId", protect, deleteWorkoutSet);

export default router;