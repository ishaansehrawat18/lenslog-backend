import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directories exist (in case the folders were removed/not committed)
const profileDir = "uploads/profiles";
const postDir = "uploads/posts";
[profileDir, postDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Only allow image files to be uploaded
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowedTypes.test(file.mimetype);
  
  

  if (extValid || mimeValid) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"), false);
  }
};

// Builds a multer storage engine for a given destination folder.
// Filenames are prefixed with a timestamp to avoid collisions.
const buildStorage = (destinationFolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destinationFolder);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });

// Upload instance for profile pictures -> uploads/profiles
export const uploadProfileImage = multer({
  storage: buildStorage(profileDir),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Upload instance for post images -> uploads/posts
export const uploadPostImage = multer({
  storage: buildStorage(postDir),
  fileFilter: imageFileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB max
});