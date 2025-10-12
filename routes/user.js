import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Add logging middleware
router.use((req, res, next) => {
  console.log(`📍 User route: ${req.method} ${req.path}`);
  console.log(`📍 Content-Type: ${req.headers["content-type"]}`);
  next();
});

// Profile routes
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(
    protect,
    (req, res, next) => {
      console.log("🔄 Processing PUT /profile request");
      console.log("🔄 Before multer - Body:", Object.keys(req.body));
      next();
    },
    upload.single("profileImage"),
    (req, res, next) => {
      console.log("🔄 After multer - File:", req.file ? "Present" : "Missing");
      console.log("🔄 After multer - Body:", Object.keys(req.body));
      if (req.file) {
        console.log("📁 File details:", {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        });
      }
      next();
    },
    updateUserProfile
  )
  .delete(protect, deleteUserAccount);

// Password change route
router.put("/change-password", protect, changePassword);

export default router;
