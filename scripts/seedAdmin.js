import dotenv from "dotenv";
import connectDB from "../config/database.js";
import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin exists
    const adminExists = await User.findOne({ email: "admin@fisheries.lk" });

    if (adminExists) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create admin
    await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@fisheries.lk",
      password: "Admin@123",
      role: "admin",
      contactNo: "0771234567",
      address: "Colombo, Sri Lanka",
    });

    console.log("Admin user created successfully");
    console.log("Email: admin@fisheries.lk");
    console.log("Password: Admin@123");

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
