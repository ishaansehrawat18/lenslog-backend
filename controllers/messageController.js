import Message from "../models/Message.js";
import mongoose from "mongoose";

// @desc    Get a list of conversations (most recent message per person)
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Aggregation: find the most recent message for each unique
    // conversation partner, sorted by most recently active first.
    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { recipient: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", userId] }, "$recipient", "$sender"],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$recipient", userId] }, { $eq: ["$isRead", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          user: {
            _id: "$user._id",
            name: "$user.name",
            username: "$user.username",
            profileImage: "$user.profileImage",
          },
          lastMessage: { text: 1, createdAt: 1, sender: 1 },
          unreadCount: 1,
        },
      },
    ]);

    return res.status(200).json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error.message);
    return res.status(500).json({ message: "Server error fetching conversations" });
  }
};

// @desc    Get full message history with a specific user
// @route   GET /api/messages/:userId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: otherUserId },
        { sender: otherUserId, recipient: req.user._id },
      ],
    }).sort({ createdAt: 1 }); // oldest first, chronological chat order

    // Mark any unread messages FROM the other person TO me as read,
    // since I'm now viewing this conversation.
    await Message.updateMany(
      { sender: otherUserId, recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Get messages error:", error.message);
    return res.status(500).json({ message: "Server error fetching messages" });
  }
};

// @desc    Send a message to a user
// @route   POST /api/messages/:userId
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const recipientId = req.params.userId;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text cannot be empty" });
    }

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      text: text.trim(),
    });

    // Real-time delivery: if the recipient is currently connected via
    // Socket.io, push this message to them instantly. req.io is attached
    // in server.js so controllers can access the socket server.
    const io = req.app.get("io");
    if (io) {
      io.to(recipientId).emit("newMessage", message);
    }

    return res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error.message);
    return res.status(500).json({ message: "Server error sending message" });
  }
};