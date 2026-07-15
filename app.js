import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

// Initialize the Express application
const app = express();

// ------------------ Global Middlewares ------------------
// Parses incoming JSON request bodies into req.body
app.use(express.json());

// Enables Cross-Origin Resource Sharing so our React frontend
// (running on a different port, or a different domain in production)
// can talk to this API. CORS_ORIGIN is set via environment variable
// so we can lock this down to our real frontend URL in production.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

// NOTE: local /uploads static file serving has been removed — images
// are now uploaded directly to Cloudinary (see middlewares/uploadMiddleware.js)
// and served from Cloudinary's own URLs, so we no longer need to serve
// anything from local disk.

// ------------------ Routes ------------------
// Root endpoint - simple health check to confirm the API is alive
app.get("/", (req, res) => {
  res.send("LensLog API Running...");
});

// Authentication routes: /api/auth/register, /api/auth/login, /api/auth/me
app.use("/api/auth", authRoutes);

// User profile routes: /api/users/profile, /api/users/profile/posts
app.use("/api/users", userRoutes);

// Post CRUD + like routes: /api/posts, /api/posts/:id/like
app.use("/api/posts", postRoutes);

// Comment routes — mounted at root /api since commentRoutes.js defines
// full paths itself: /api/posts/:id/comments and /api/comments/:id
app.use("/api", commentRoutes);

// Search route: /api/search?query=...
app.use("/api/search", searchRoutes);

// ------------------ Error Handling ------------------
// IMPORTANT: these must be registered LAST, after all other routes.
app.use(notFound);
app.use(errorHandler);

export default app;