import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

// @desc    Get platform-wide stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalPosts, totalComments, posts] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      Post.find().select("likes"),
    ]);

    const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0);

    return res.status(200).json({ totalUsers, totalPosts, totalComments, totalLikes });
  } catch (error) {
    console.error("Get stats error:", error.message);
    return res.status(500).json({ message: "Server error fetching stats" });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error.message);
    return res.status(500).json({ message: "Server error fetching users" });
  }
};

// @desc    Delete a user (admin action)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent an admin from deleting their own account through this route
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account here" });
    }

    await user.deleteOne();
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error.message);
    return res.status(500).json({ message: "Server error deleting user" });
  }
};

// @desc    Get all posts (admin view)
// @route   GET /api/admin/posts
// @access  Private/Admin
export const getAllPostsAdmin = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name username profileImage")
      .sort({ createdAt: -1 });
    return res.status(200).json(posts);
  } catch (error) {
    console.error("Get all posts (admin) error:", error.message);
    return res.status(500).json({ message: "Server error fetching posts" });
  }
};

// @desc    Delete any post (admin action, e.g. inappropriate content)
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
export const deletePostAdmin = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    await post.deleteOne();
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post (admin) error:", error.message);
    return res.status(500).json({ message: "Server error deleting post" });
  }
};