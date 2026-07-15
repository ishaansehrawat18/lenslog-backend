import User from "../models/User.js";
import Post from "../models/Post.js";

// @desc    Search users and posts by a query string
// @route   GET /api/search?query=mountains
// @access  Public
export const search = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({ message: "A search query is required" });
    }

    // Case-insensitive partial match. Escaping special regex characters
    // prevents a malformed/malicious query string from breaking the regex.
    const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQuery, "i");

    // Search users by name or username
    const users = await User.find({
      $or: [{ name: regex }, { username: regex }],
    }).select("-password");

    // Search posts by caption, location, or tags
    const posts = await Post.find({
      $or: [{ caption: regex }, { location: regex }, { tags: regex }],
    })
      .populate("user", "name username profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({ users, posts });
  } catch (error) {
    console.error("Search error:", error.message);
    return res.status(500).json({ message: "Server error performing search" });
  }
};