// "dotenv/config" must be the very first import in this file. In ES
// Modules, all imports are fully evaluated before any of this file's
// own code runs — so if dotenv.config() were called after importing
// app.js, the entire app.js dependency chain (including Cloudinary's
// config, which reads process.env at import time) would already have
// run with empty environment variables. Importing "dotenv/config"
// directly (instead of calling dotenv.config() as a later statement)
// loads the .env file immediately, before anything else is evaluated.
import "dotenv/config";
import http from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

// Socket.io needs a raw Node HTTP server to attach to — Express's
// app.listen() normally creates one internally and hides it, so we
// create it explicitly here instead, then hand it to both Express
// (via httpServer, same as app.listen would) and Socket.io.
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  },
});

// Socket authentication: runs once when a client first connects,
// using the same JWT they already have from logging in via REST.
// Unlike REST routes, we don't re-check this on every single message —
// once connected, the socket is trusted for the life of that connection.
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Not authorized, no token provided"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    next(new Error("Not authorized, invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  // Each user joins a private "room" named after their own user ID.
  // Sending a message to that room ID (io.to(userId).emit(...)) reaches
  // every device/tab that user currently has open, and only them.
  socket.join(socket.userId);

  socket.on("disconnect", () => {
    // No explicit cleanup needed — Socket.io automatically removes
    // the socket from its room(s) on disconnect.
  });
});

// Make the io instance available to route controllers via
// req.app.get("io") — this is how messageController.js emits
// real-time events after saving a message to the database.
app.set("io", io);

connectDB().then(() => {
  httpServer.listen(PORT, () =>
    console.log(`✅ LensLog server running on http://localhost:${PORT}`)
  );
});