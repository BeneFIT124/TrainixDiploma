import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  createNutritionPlan,
  getMyNutritionPlans,
  getNutritionPlanById,
  updateNutritionPlan,
  deleteNutritionPlan,
  addNutritionPlanItem,
  getNutritionPlanItems,
  deleteNutritionPlanItem,
} from "../controllers/nutritionPlan.controller.js";

const router = express.Router();

router.post("/", protect, requireRole("trainer", "admin"), createNutritionPlan);
router.get("/my", protect, requireRole("trainer", "admin"), getMyNutritionPlans);
router.get("/:id", protect, requireRole("trainer", "admin"), getNutritionPlanById);
router.put("/:id", protect, requireRole("trainer", "admin"), updateNutritionPlan);
router.delete("/:id", protect, requireRole("trainer", "admin"), deleteNutritionPlan);

router.post(
  "/:planId/items",
  protect,
  requireRole("trainer", "admin"),
  addNutritionPlanItem
);

router.get(
  "/:planId/items",
  protect,
  requireRole("trainer", "admin"),
  getNutritionPlanItems
);

router.delete(
  "/:planId/items/:itemId",
  protect,
  requireRole("trainer", "admin"),
  deleteNutritionPlanItem
);

export default router;