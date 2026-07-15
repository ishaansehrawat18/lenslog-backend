import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

// Needed to resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Serve uploaded images statically, e.g.:
// http://localhost:5000/uploads/posts/image-12345.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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