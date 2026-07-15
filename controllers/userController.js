import User from "../models/User.js";
import Post from "../models/Post.js";

// @desc    Get the logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    // req.user was attached by the protect middleware (password already excluded)
    return res.status(200).json(req.user);
  } catch (error) {
    console.error("Get profile error:", error.message);
    return res.status(500).json({ message: "Server error fetching profile" });
  }
};

// @desc    Update the logged-in user's profile (name, username, bio, profile picture)
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, username, bio } = req.body;

    // If username is being changed, make sure it's not already taken by someone else
    if (username && username.toLowerCase() !== user.username) {
      const usernameExists = await User.findOne({ username: username.toLowerCase() });
      if (usernameExists) {
        return res.status(400).json({ message: "Username already in use" });
      }
      user.username = username.toLowerCase();
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    // If a new profile picture was uploaded, Multer attaches it to req.file
    if (req.file) {
      // Store a web-accessible relative path (served statically from app.js)
      user.profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      bio: updatedUser.bio,
      profileImage: updatedUser.profileImage,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return res.status(500).json({ message: "Server error updating profile" });
  }
};

// @desc    Get all posts belonging to the logged-in user
// @route   GET /api/users/profile/posts
// @access  Private
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .populate("user", "name username profileImage")
      .sort({ createdAt: -1 }); // newest first

    return res.status(200).json(posts);
  } catch (error) {
    console.error("Get my posts error:", error.message);
    return res.status(500).json({ message: "Server error fetching your posts" });
  }
};