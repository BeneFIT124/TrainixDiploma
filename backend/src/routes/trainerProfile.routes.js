import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createTrainerProfile,
  getMyTrainerProfile,
  updateTrainerProfile,
} from "../controllers/trainerProfile.controller.js";
import { becomeTrainerDemo } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/", protect, createTrainerProfile);
router.post("/become-demo", protect, becomeTrainerDemo);
router.get("/my", protect, getMyTrainerProfile);
router.put("/my", protect, updateTrainerProfile);

export default router;
