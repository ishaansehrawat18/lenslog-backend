import User from "../models/User.js";
import Notification from "../models/Notification.js";

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
export const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user._id.toString();

    if (targetId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetId },
    });
    await User.findByIdAndUpdate(targetId, {
      $addToSet: { followers: currentUserId },
    });
// Create a notification for the user being followed
    await Notification.create({
      recipient: targetId,
      sender: currentUserId,
      type: "follow",
    });

    const updatedTarget = await User.findById(targetId).select("followers");
    const updatedCurrentUser = await User.findById(currentUserId).select("following");

    return res.status(200).json({
      following: true,
      followersCount: updatedTarget.followers.length,
      followingCount: updatedCurrentUser.following.length,
    });
  } catch (error) {
    console.error("Follow user error:", error.message);
    return res.status(500).json({ message: "Server error following user" });
  }
};

// @desc    Unfollow a user
// @route   POST /api/users/:id/unfollow
// @access  Private
export const unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user._id.toString();

    if (targetId === currentUserId) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetId },
    });
    await User.findByIdAndUpdate(targetId, {
      $pull: { followers: currentUserId },
    });

    const updatedTarget = await User.findById(targetId).select("followers");
    const updatedCurrentUser = await User.findById(currentUserId).select("following");

    return res.status(200).json({
      following: false,
      followersCount: updatedTarget.followers.length,
      followingCount: updatedCurrentUser.following.length,
    });
  } catch (error) {
    console.error("Unfollow user error:", error.message);
    return res.status(500).json({ message: "Server error unfollowing user" });
  }
};

// @desc    Get a user's followers list
// @route   GET /api/users/:id/followers
// @access  Public
export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "name username profileImage"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.followers);
  } catch (error) {
    console.error("Get followers error:", error.message);
    return res.status(500).json({ message: "Server error fetching followers" });
  }
};

// @desc    Get who a user is following
// @route   GET /api/users/:id/following
// @access  Public
export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      "name username profileImage"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.following);
  } catch (error) {
    console.error("Get following error:", error.message);
    return res.status(500).json({ message: "Server error fetching following" });
  }
};