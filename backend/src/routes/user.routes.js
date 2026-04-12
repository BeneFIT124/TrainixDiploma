import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.put("/profile", protect, updateProfile);

export default router;