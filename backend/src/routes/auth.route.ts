import express from "express";
import {
  signup,
  login,
  logout,
  refreshToken,
  updateProfile,
  checkAuth,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware"; // Assuming you have a protect middleware

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Protected routes
router.post("/logout", protect, logout);
router.put("/profile", protect, updateProfile);
router.get("/check-auth", protect, checkAuth);

export default router;
