import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protects routes by requiring a valid JWT in the Authorization header.
// On success, attaches the authenticated user (minus password) to req.user.
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Expecting header format: "Bearer <token>" — split(" ").filter(Boolean)
    // tolerates accidental extra spaces (e.g. "Bearer   <token>") instead of
    // silently extracting an empty string as the token.
    if (!authHeader || !authHeader.trim().toLowerCase().startsWith("bearer")) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    const parts = authHeader.split(" ").filter(Boolean);
    const token = parts[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    // Verify the token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from DB, excluding the password field
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    // Attach user to the request object for use in controllers
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, invalid or expired token" });
  }
};

export default protect;