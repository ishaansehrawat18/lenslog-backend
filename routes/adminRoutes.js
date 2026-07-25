import express from "express";
import {
  getStats,
  getAllUsers,
  deleteUser,
  getAllPostsAdmin,
  deletePostAdmin,
} from "../controllers/adminController.js";
import protect from "../middlewares/authMiddleware.js";
import admin from "../middlewares/adminMiddleware.js";

const router = express.Router();

// Every route here requires BOTH a valid JWT AND an admin role
router.get("/stats", protect, admin, getStats);
router.get("/users", protect, admin, getAllUsers);
router.delete("/users/:id", protect, admin, deleteUser);
router.get("/posts", protect, admin, getAllPostsAdmin);
router.delete("/posts/:id", protect, admin, deletePostAdmin);

export default router;