import express from "express";
import { getConversations, getMessages, sendMessage } from "../controllers/messageController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/conversations", protect, getConversations);
router.get("/:userId", protect, getMessages);
router.post("/:userId", protect, sendMessage);

export default router;