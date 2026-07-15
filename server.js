// "dotenv/config" must be the very first import in this file. In ES
// Modules, all imports are fully evaluated before any of this file's
// own code runs — so if dotenv.config() were called after importing
// app.js, the entire app.js dependency chain (including Cloudinary's
// config, which reads process.env at import time) would already have
// run with empty environment variables. Importing "dotenv/config"
// directly (instead of calling dotenv.config() as a later statement)
// loads the .env file immediately, before anything else is evaluated.
import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`✅ LensLog server running on http://localhost:${PORT}`));
});