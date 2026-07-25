import express from "express";
import {
  getProfile,
  updateProfile,
  getMyPosts,
  getUserByUsername,
  getSuggestedUsers,
} from "../controllers/userController.js";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../controllers/followController.js";
import { getBookmarks } from "../controllers/bookmarkController.js";
import protect from "../middlewares/authMiddleware.js";
import { uploadProfileImage } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// GET  /api/users/profile        -> view own profile
// PUT  /api/users/profile        -> update profile (with optional image upload)
// GET  /api/users/profile/posts  -> list own posts
router.get("/profile", protect, getProfile);
router.put("/profile", protect, uploadProfileImage.single("profileImage"), updateProfile);
router.get("/profile/posts", protect, getMyPosts);

// Follow system
router.post("/:id/follow", protect, followUser);
router.post("/:id/unfollow", protect, unfollowUser);
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);

// Bookmarks + Suggestions — IMPORTANT: both must be registered BEFORE
// "/:username" below. Since ":username" is a single dynamic segment,
// it would otherwise incorrectly match "/bookmarks" or "/suggestions"
// as if they were literal usernames, and this misrouting would happen
// silently (no error, just the wrong handler running).
router.get("/bookmarks", protect, getBookmarks);
router.get("/suggestions", protect, getSuggestedUsers);

// GET /api/users/:username -> public profile view for any user.
// Must stay LAST among GET routes on this router.
router.get("/:username", getUserByUsername);

export default router;