import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { becomeTrainerDemo, updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.put("/profile", protect, updateProfile);
router.post("/become-trainer-demo", protect, becomeTrainerDemo);

export default router;
