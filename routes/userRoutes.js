import express from "express";
import {
  getProfile,
  updateProfile,
  getMyPosts,
  getUserByUsername,
} from "../controllers/userController.js";
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

// GET /api/users/:username -> public profile view for any user.
// IMPORTANT: this must be registered LAST among GET routes on this
// router — since ":username" is a dynamic segment, if it were placed
// before "/profile", a request to /api/users/profile could incorrectly
// match here first with username="profile".
router.get("/:username", getUserByUsername);

export default router;