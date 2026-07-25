import User from "../models/User.js";
import Post from "../models/Post.js";

// @desc    Bookmark a post
// @route   POST /api/posts/:id/bookmark
// @access  Private
export const addBookmark = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { bookmarks: req.params.id },
    });

    return res.status(200).json({ bookmarked: true });
  } catch (error) {
    console.error("Add bookmark error:", error.message);
    return res.status(500).json({ message: "Server error bookmarking post" });
  }
};

// @desc    Remove a bookmark
// @route   DELETE /api/posts/:id/bookmark
// @access  Private
export const removeBookmark = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { bookmarks: req.params.id },
    });

    return res.status(200).json({ bookmarked: false });
  } catch (error) {
    console.error("Remove bookmark error:", error.message);
    return res.status(500).json({ message: "Server error removing bookmark" });
  }
};

// @desc    Get all posts the logged-in user has bookmarked
// @route   GET /api/users/bookmarks
// @access  Private
export const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "bookmarks",
      populate: { path: "user", select: "name username profileImage" },
    });

    return res.status(200).json(user.bookmarks);
  } catch (error) {
    console.error("Get bookmarks error:", error.message);
    return res.status(500).json({ message: "Server error fetching bookmarks" });
  }
};