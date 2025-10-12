import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
//import connectCloudinary from './config/cloudinary.js';
import dotenv from "dotenv";
//import { connect } from 'mongoose';
import bodyParser from 'body-parser';
import passportConfig from './config/passport.js';
//import passport from "passport";

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import feoRoutes from "./routes/feo.js";
import adminRoutes from "./routes/admin.js";

// Routes
import adminRouter from './routes/adminRoute.js';
import userRouter from './routes/userRoute.js';
import feoRouter from './routes/feoRoute.js';
import speciesRoutes from "./routes/speciesRoutes.js";
import speciesRequestRoutes from "./routes/speciesRequestRoutes.js";
// import { reportRouter } from "./routes/reportRoutes.js";
import favoriteRoutes from './routes/favoritesRoutes.js';

import reportRouter from "./routes/reportRoutes.js";
import notifyRouter from './routes/notificationRoute.js';

const app = express()
//app.use(cors());

//app.use(express.json());
//app.use(bodyParser.json());

//const port = process.env.PORT || 8081
connectDB()
//connectCloudinary()
dotenv.config();

// // Api endpoints
// app.use('/api/admin', adminRouter);
// app.use('/api/user', userRouter);
// app.use('/api/feo', feoRouter);
// app.use('/api/report', reportRouter);
// app.use("/api/species", speciesRoutes);
// app.use('/api/favorites', favoriteRoutes);

// // Species Management Routes
// app.use("/species", speciesRoutes);
// app.use("/speciesRequest", speciesRequestRoutes);
// app.use('/api/notification', notifyRouter);

// app.get('/', (req, res) => {
//   res.send('API Working')
// })

// Start server
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

// app.listen(port, '0.0.0.0', () => {
//   console.log(`Server running on http://0.0.0.0:${port}`);
// });


//Added by ashwin
// CORS - MUST be before body parser and routes
app.use(
  cors({
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight requests
//app.options("*", cors());

// Body parser - MUST be before routes
// Important: Don't use express.json() for multipart routes, multer will handle it
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(bodyParser.json());

// Passport middleware
app.use(passportConfig.initialize());

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  if (req.file) {
    console.log("📁 File received:", req.file.fieldname);
  }
  next();
});

// Test route
// app.get("/", (req, res) => {
//   res.json({ message: "API is running..." });
// });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feo", feoRoutes);
app.use("/api/admin", adminRoutes);

//Added Routes
// Api endpoints
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/feo', feoRouter);
app.use('/api/report', reportRouter);
app.use("/api/species", speciesRoutes);
app.use('/api/favorites', favoriteRoutes);

// Species Management Routes
app.use("/species", speciesRoutes);
app.use("/speciesRequest", speciesRequestRoutes);
app.use('/api/notification', notifyRouter);

// Error handler - MUST be after routes
app.use((err, req, res, next) => {
  console.error("=== ERROR ===");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);

  // Special handling for multer errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File is too large. Maximum size is 5MB",
      });
    }
    return res.status(400).json({
      message: `Upload error: ${err.message}`,
    });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 8081;

app.listen(PORT, "0.0.0.0", () => {
  // console.log(
  //   `✅ Server running in ${
  //     process.env.NODE_ENV || "development"
  //   } mode on port ${PORT}`
  // );
  console.log(`📍 API available at http://localhost:${PORT}`);
  console.log(`📍 Network API available at http://0.0.0.0:${PORT}`);
});
