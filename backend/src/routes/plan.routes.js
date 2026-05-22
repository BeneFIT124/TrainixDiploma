import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getMyPurchasedPlans,
  getPlanById,
  getPlans,
  getTrainerPlans,
  purchasePlan,
} from "../controllers/plan.controller.js";

const router = express.Router();

router.get("/", protect, getPlans);
router.get("/purchased/my", protect, getMyPurchasedPlans);
router.get("/trainer/:trainerProfileId", protect, getTrainerPlans);
router.get("/:type/:id", protect, getPlanById);
router.post("/:type/:id/purchase", protect, purchasePlan);

export default router;
