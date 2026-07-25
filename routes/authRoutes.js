import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/authController.js";
import { forgotPassword, resetPassword } from "../controllers/passwordController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected route — requires a valid JWT (handled by the protect middleware)
router.get("/me", protect, getMe);

export default router;