import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Add helpful connection logs
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Important: Add connection options for stable connection
    await mongoose.connect(`${process.env.MONGODB_URI}/AquaShield`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10s timeout
    });

  } catch (error) {
    console.error("Failed to connect MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
