import express from "express";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import protect from "../middlewares/authMiddleware.js";
import { uploadPostImage } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Public routes — anyone can browse the feed and view a single post
router.get("/", getPosts);
router.get("/:id", getPostById);

// Protected routes — must be logged in
router.post("/", protect, uploadPostImage.single("image"), createPost);
router.put("/:id", protect, uploadPostImage.single("image"), updatePost);
router.delete("/:id", protect, deletePost);

export default router;