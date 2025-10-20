import express from "express";
import {
  createFEO,
  getAllFEOs,
  getFEOById,
  updateFEO,
  deleteFEO,
  getFEOProfile,
  updateFEOProfile,
  changeFEOPassword,
  createFEOCloudinary, // KEPT FOR REFERENCE
  updateFEOCloudinary, // KEPT FOR REFERENCE
  updateFEOProfileCloudinary, // KEPT FOR REFERENCE
} from "../controllers/feoController.js";
import { protect, admin } from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js"; // KEPT FOR REFERENCE

const router = express.Router();

// NEW: FEO self-management routes (MUST come before /:id routes) - BASE64 VERSION
router
  .route("/profile/me")
  .get(protect, getFEOProfile)
  .put(protect, updateFEOProfile); // No multer middleware for Base64

// OLD: FEO self-management routes (KEPT FOR REFERENCE) - CLOUDINARY VERSION
router.put(
  "/profile/me/cloudinary",
  protect,
  upload.single("profileImage"),
  updateFEOProfileCloudinary
);

router.route("/profile/change-password").put(protect, changeFEOPassword);

// NEW: Admin routes - BASE64 VERSION
router
  .route("/")
  .get(protect, admin, getAllFEOs)
  .post(protect, admin, createFEO); // No multer middleware for Base64

router
  .route("/:id")
  .get(protect, admin, getFEOById)
  .put(protect, admin, updateFEO) // No multer middleware for Base64
  .delete(protect, admin, deleteFEO);

// OLD: Admin routes (KEPT FOR REFERENCE) - CLOUDINARY VERSION
router.post(
  "/cloudinary",
  protect,
  admin,
  upload.single("profileImage"),
  createFEOCloudinary
);

router.put(
  "/:id/cloudinary",
  protect,
  admin,
  upload.single("profileImage"),
  updateFEOCloudinary
);

export default router;
