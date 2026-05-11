import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createExercise, getExercises, deleteExercise } from "../controllers/exercise.controller.js";

const router = express.Router();

router.post("/", protect, createExercise);
router.get("/",protect, getExercises);
router.delete("/:id", protect, deleteExercise);

export default router;