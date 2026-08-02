import Post from "../models/Post.js";
import Notification from "../models/Notification.js";

// A file's mimetype (e.g. "video/mp4", "image/jpeg") tells us which
// kind of media was actually uploaded.
const getMediaType = (mimetype) => (mimetype?.startsWith("video") ? "video" : "image");

// @desc    Get all posts (feed), newest first, paginated
// @route   GET /api/posts?page=1&limit=9
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 9, 1);
    const skip = (page - 1) * limit;

    // Fetch one extra post beyond the requested limit — if we get it
    // back, that tells us there's a next page, without needing a
    // separate (slower) countDocuments() query just to know that.
    const posts = await Post.find({})
      .populate("user", "name username profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit + 1);

    const hasMore = posts.length > limit;
    const pagePosts = hasMore ? posts.slice(0, limit) : posts;

    return res.status(200).json({ posts: pagePosts, hasMore, page });
  } catch (error) {
    console.error("Get posts error:", error.message);
    return res.status(500).json({ message: "Server error fetching posts" });
  }
};

// @desc    Get a single post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "user",
      "name username profileImage"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error("Get post by id error:", error.message);
    // Invalid ObjectId format also lands here
    return res.status(400).json({ message: "Invalid post ID" });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { caption, location, tags } = req.body;

    // The media is required — Multer attaches the uploaded file to req.file
    if (!req.file) {
      return res.status(400).json({ message: "Post image or video is required" });
    }

    // tags may arrive as a comma-separated string (e.g. "sunset,portrait")
    const parsedTags = tags
      ? tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

    const post = await Post.create({
      user: req.user._id,
      image: req.file.path,
      mediaType: getMediaType(req.file.mimetype),
      caption: caption || "",
      location: location || "",
      tags: parsedTags,
    });

    const populatedPost = await post.populate("user", "name username profileImage");

    return res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Create post error:", error.message);
    return res.status(500).json({ message: "Server error creating post" });
  }
};

// @desc    Update a post (caption, location, tags, optionally media)
// @route   PUT /api/posts/:id
// @access  Private (owner only)
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Ownership check — only the post's creator can edit it
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    const { caption, location, tags } = req.body;

    if (caption !== undefined) post.caption = caption;
    if (location !== undefined) post.location = location;
    if (tags !== undefined) {
      post.tags = tags.split(",").map((tag) => tag.trim()).filter(Boolean);
    }

    // Optional new media — req.file.path is already the full Cloudinary URL
    if (req.file) {
      post.image = req.file.path;
      post.mediaType = getMediaType(req.file.mimetype);
    }

    const updatedPost = await post.save();
    const populatedPost = await updatedPost.populate("user", "name username profileImage");

    return res.status(200).json(populatedPost);
  } catch (error) {
    console.error("Update post error:", error.message);
    return res.status(500).json({ message: "Server error updating post" });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (owner only)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Ownership check — only the post's creator can delete it
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error.message);
    return res.status(500).json({ message: "Server error deleting post" });
  }
};

// @desc    Toggle like/unlike on a post
// @route   POST /api/posts/:id/like
// @access  Private
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user._id.toString();
    // Check whether this user has already liked the post
    const alreadyLikedIndex = post.likes.findIndex((id) => id.toString() === userId);

    let liked;
    if (alreadyLikedIndex === -1) {
      // Not liked yet -> add the like
      post.likes.push(req.user._id);
      liked = true;

      // Notify the post owner (skip if liking your own post)
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          post: post._id,
          type: "like",
        });
      }
    } else {
      // Already liked -> remove it (unlike)
      post.likes.splice(alreadyLikedIndex, 1);
      liked = false;
    }

    await post.save();

    return res.status(200).json({
      liked,
      likesCount: post.likes.length,
      likes: post.likes,
    });
  } catch (error) {
    console.error("Toggle like error:", error.message);
    return res.status(500).json({ message: "Server error toggling like" });
  }
};