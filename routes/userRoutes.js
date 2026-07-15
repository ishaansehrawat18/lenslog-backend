import express from "express";
import { getProfile, updateProfile, getMyPosts } from "../controllers/userController.js";
import protect from "../middlewares/authMiddleware.js";
import { uploadProfileImage } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// All routes below require a valid JWT (protect middleware)

// GET  /api/users/profile        -> view own profile
// PUT  /api/users/profile        -> update profile (with optional image upload)
// GET  /api/users/profile/posts  -> list own posts
router.get("/profile", protect, getProfile);
router.put("/profile", protect, uploadProfileImage.single("profileImage"), updateProfile);
router.get("/profile/posts", protect, getMyPosts);

export default router;