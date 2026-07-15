import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    // Validate non-empty comment text
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text cannot be empty" });
    }

    // Make sure the post actually exists before attaching a comment to it
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.create({
      post: req.params.id,
      user: req.user._id,
      text: text.trim(),
    });

    const populatedComment = await comment.populate("user", "name username profileImage");

    return res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Add comment error:", error.message);
    return res.status(500).json({ message: "Server error adding comment" });
  }
};

// @desc    Get all comments for a post, newest first
// @route   GET /api/posts/:id/comments
// @access  Public
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("user", "name username profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json(comments);
  } catch (error) {
    console.error("Get comments error:", error.message);
    return res.status(500).json({ message: "Server error fetching comments" });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (comment owner only)
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Ownership check — only the comment's author can delete it
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await comment.deleteOne();

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error.message);
    return res.status(500).json({ message: "Server error deleting comment" });
  }
};
