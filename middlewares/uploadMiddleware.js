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

// Cloudinary storage for post images — uploaded into "lenslog/posts"
const postStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "lenslog/posts",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1600, height: 1600, crop: "limit" }],
  },
});

// 5MB limit for profile pictures, 8MB for post images — same limits as before
export const uploadProfileImage = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadPostImage = multer({
  storage: postStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
});