import { callGroqText, callGroqVision } from "../utils/callGroq.js";

// @desc    Suggest a caption for an uploaded image (kept in memory only,
//          never saved to disk or Cloudinary — just used to ask the AI)
// @route   POST /api/ai/suggest-caption
// @access  Private
export const suggestCaption = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "An image file is required" });
    }

    const imageBase64 = req.file.buffer.toString("base64");
    const imageMimeType = req.file.mimetype;

    const caption = await callGroqVision({
      prompt:
        "Write one short, natural, engaging Instagram-style caption for this photo. " +
        "No hashtags, no quotation marks, no emojis unless truly fitting. Just the caption text, nothing else.",
      imageBase64,
      imageMimeType,
    });

    return res.status(200).json({ caption });
  } catch (error) {
    console.error("Suggest caption error:", error.message);
    return res.status(500).json({ message: "Could not generate a caption right now" });
  }
};

// @desc    Chat with an AI assistant (general help, not tied to a specific post)
// @route   POST /api/ai/chat
// @access  Private
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const reply = await callGroqText(
      "You are a friendly, concise assistant inside LensLog, a photography community app. " +
        "Help the user with questions about photography, using the app, or general conversation. " +
        "Keep responses brief and conversational.\n\nUser: " +
        message.trim()
    );

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("AI chat error:", error.message);
    return res.status(500).json({ message: "Could not get a response right now" });
  }
};