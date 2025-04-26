import express from "express";
import {
  login,
  logout,
  signup,
  updateProfile,
  refreshToken,
} from "../controllers/auth.controller";
// import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

router.patch("/update-profile", updateProfile);
//
router.get("/check", (req, res) => {
  res.status(200).json({ message: "Check auth" });
});
// router.get("/check", protectRoute, checkAuth);

export default router;
