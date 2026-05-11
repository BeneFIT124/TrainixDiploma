import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  createTrainerApplication,
  getMyTrainerApplications,
  getAllTrainerApplications,
  reviewTrainerApplication,
} from "../controllers/trainerApplication.controller.js";

const router = express.Router();

router.post("/", protect, createTrainerApplication);
router.get("/my", protect, getMyTrainerApplications);

// admin only
router.get("/", protect, requireRole("admin"), getAllTrainerApplications);
router.put("/:id/review", protect, requireRole("admin"), reviewTrainerApplication);

export default router;