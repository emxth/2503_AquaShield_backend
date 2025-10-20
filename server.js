<<<<<<< Updated upstream
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Routes
// .. Add your route imports here ..
// const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
// .. Add your routes here ..
// app.use('/api/users', userRoutes);

// Example protected routes (keep these if you need them)
// app.get('/api/private', auth, (req, res) => {
//   res.json({ success: true, data: 'Protected route accessed' });
// });

// app.get('/api/admin', adminAuth, (req, res) => {
//   res.json({ success: true, data: 'Admin route accessed' });
// });

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
=======
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/mongodb.js";

// Load environment variables FIRST
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Basic middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

// Import and mount routes
console.log("🛠 Loading routes...");

// Import routes
const authRoutes = await import("./routes/auth.js");
const userRoutes = await import("./routes/user.js");
const feoRoutes = await import("./routes/feo.js");
const adminRoutes = await import("./routes/admin.js");
const reportRoutes = await import("./routes/reportRoutes.js");
const speciesRoutes = await import("./routes/speciesRoutes.js");
const speciesRequestRoutes = await import("./routes/speciesRequestRoutes.js");
const favoriteRoutes = await import("./routes/favoritesRoutes.js");
const notifyRoutes = await import("./routes/notificationRoute.js");

// Mount routes
app.use("/api/auth", authRoutes.default);
console.log("✅ Auth routes mounted");

app.use("/api/users", userRoutes.default);
console.log("✅ User routes mounted");

app.use("/api/feo", feoRoutes.default);
console.log("✅ FEO routes mounted");

app.use("/api/admin", adminRoutes.default);
console.log("✅ Admin routes mounted");

app.use("/api/report", reportRoutes.default);
console.log("✅ Report routes mounted");

app.use("/api/species", speciesRoutes.default);
console.log("✅ Species routes mounted");

app.use("/api/speciesRequest", speciesRequestRoutes.default);
console.log("✅ Species Request routes mounted");

app.use("/api/favorites", favoriteRoutes.default);
console.log("✅ Favorites routes mounted");

app.use("/api/notification", notifyRoutes.default);
console.log("✅ Notification routes mounted");

console.log("🎉 All routes mounted successfully!");

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ message: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`📍 Server running on http://localhost:${PORT}`);
});
>>>>>>> Stashed changes
