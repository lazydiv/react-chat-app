import express from "express";
import { protect } from "../middleware/auth.middleware";

import {
  getUsers,
  getMessages,
  sendMessage,
} from "../controllers/message.controller";
const router = express.Router();

router.get("/users", protect, getUsers);
router.get("/:id", protect, getMessages);
router.post("/send/:id", protect, sendMessage);

export default router;
