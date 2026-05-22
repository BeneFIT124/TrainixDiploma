import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getMyStatistics } from "../controllers/statistics.controller.js";

const router = express.Router();

router.get("/me", protect, getMyStatistics);

export default router;
