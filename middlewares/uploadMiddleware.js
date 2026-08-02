import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Cloudinary storage for profile pictures — uploaded into a
// "lenslog/profiles" folder in your Cloudinary account.
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "lenslog/profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    // Automatically resize large uploads down to a sane max size
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

// Cloudinary storage for post images/videos — uploaded into "lenslog/posts".
// resource_type: "auto" lets Cloudinary detect whether the upload is an
// image or a video and handle it correctly either way — without this,
// Cloudinary defaults to expecting images only and would reject videos.
const postStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "lenslog/posts",
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "mov", "webm"],
    // Transformations only apply to images — Cloudinary ignores width/height
    // crop settings for video uploads, so this stays safe for both types.
    transformation: [{ width: 1600, height: 1600, crop: "limit" }],
  },
});

// 5MB limit for profile pictures. Post uploads raised to 50MB to
// accommodate short videos (images still typically land well under this).
export const uploadProfileImage = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadPostImage = multer({
  storage: postStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Memory storage — used only for the AI caption-suggestion endpoint,
// where we need the raw file bytes temporarily (to send to Groq as
// base64) but don't want to actually save the file anywhere. Nothing
// touches disk or Cloudinary here; req.file.buffer holds the bytes
// in memory for the life of that single request only.
export const uploadToMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});