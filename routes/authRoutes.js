import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/authController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route — requires a valid JWT (handled by the protect middleware)
router.get("/me", protect, getMe);

export default router;