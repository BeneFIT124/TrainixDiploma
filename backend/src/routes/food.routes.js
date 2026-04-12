import express from "express";
import { createFood, getFoods } from "../controllers/food.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createFood);
router.get("/", protect, getFoods);

export default router;