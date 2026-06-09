import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createReview,
  getTrainerReviews,
} from "../controllers/review.controller.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/trainer/:trainerProfileId", protect, getTrainerReviews);

export default router;
