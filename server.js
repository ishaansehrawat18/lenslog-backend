import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

// Load environment variables from .env into process.env
dotenv.config();



const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas, then start listening for requests.
// We wait for the DB connection first so the app never accepts
// traffic while the database is unreachable.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ LensLog server running on http://localhost:${PORT}`);
  });
});