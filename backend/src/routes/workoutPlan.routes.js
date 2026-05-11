import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  createWorkoutPlan,
  getMyWorkoutPlans,
  getWorkoutPlanById,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  addWorkoutPlanItem,
  getWorkoutPlanItems,
  deleteWorkoutPlanItem,
} from "../controllers/workoutPlan.controller.js";

const router = express.Router();

router.post("/", protect, requireRole("trainer", "admin"), createWorkoutPlan);
router.get("/my", protect, requireRole("trainer", "admin"), getMyWorkoutPlans);
router.get("/:id", protect, requireRole("trainer", "admin"), getWorkoutPlanById);
router.put("/:id", protect, requireRole("trainer", "admin"), updateWorkoutPlan);
router.delete("/:id", protect, requireRole("trainer", "admin"), deleteWorkoutPlan);

router.post(
  "/:planId/items",
  protect,
  requireRole("trainer", "admin"),
  addWorkoutPlanItem
);
router.get(
  "/:planId/items",
  protect,
  requireRole("trainer", "admin"),
  getWorkoutPlanItems
);
router.delete(
  "/:planId/items/:itemId",
  protect,
  requireRole("trainer", "admin"),
  deleteWorkoutPlanItem
);

export default router;