import mongoose from "mongoose";

// Connects to MongoDB Atlas using the URI stored in .env
// Called once from server.js when the app starts
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Exit the process with failure — there's no point running
    // the API if the database isn't reachable
    process.exit(1);
  }
};

export default connectDB;
