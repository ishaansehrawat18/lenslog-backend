import express from "express";
import { addComment, getComments, deleteComment } from "../controllers/commentController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

// These paths are written in full because this router is mounted at
// the root "/api" in app.js (not "/api/comments"), so it can expose
// both /api/posts/:id/comments AND /api/comments/:id from one file.

// POST /api/posts/:id/comments -> add a comment to a post (protected)
router.post("/posts/:id/comments", protect, addComment);

// GET /api/posts/:id/comments -> list comments for a post (public)
router.get("/posts/:id/comments", getComments);

// DELETE /api/comments/:id -> delete a comment (protected, owner only)
router.delete("/comments/:id", protect, deleteComment);

export default router;