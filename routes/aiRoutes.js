import express from "express";
import { suggestCaption, chatWithAI } from "../controllers/aiController.js";
import protect from "../middlewares/authMiddleware.js";
import { uploadToMemory } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/suggest-caption", protect, uploadToMemory.single("image"), suggestCaption);
router.post("/chat", protect, chatWithAI);

export default router;