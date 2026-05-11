import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createMeal,
  getMeals,
  addMealItem,
  getMealItems,
  getDailyNutritionSummary,
  getMealsByDate,
  deleteMealItem,
  deleteMeal,
} from "../controllers/meal.controller.js";

const router = express.Router();

router.post("/", protect, createMeal);
router.get("/", protect, getMeals);
router.get("/by-date", protect, getMealsByDate);
router.get("/summary/daily", protect, getDailyNutritionSummary);

router.post("/:mealId/items", protect, addMealItem);
router.get("/:mealId/items", protect, getMealItems);
router.delete("/:mealId/items/:itemId", protect, deleteMealItem);

router.delete("/:mealId", protect, deleteMeal);


export default router;