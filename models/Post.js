import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String,
      required: [true, "Post image is required"],
    },
    caption: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    likes: {
      // Array of User IDs who liked the post
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    // NOTE: Comments are no longer embedded here — see models/Comment.js.
    // Each Comment document references this post via a `post` field,
    // which scales better than an embedded array (no document size
    // limits, and comments can be queried/paginated independently).
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;