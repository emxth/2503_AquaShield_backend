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
} from "../controllers/feoController.js";
import { protect, admin } from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// FEO self-management routes (MUST come before /:id routes)
router
  .route("/profile/me")
  .get(protect, getFEOProfile)
  .put(protect, upload.single("profileImage"), updateFEOProfile);

router.route("/profile/change-password").put(protect, changeFEOPassword);

// Admin routes
router
  .route("/")
  .get(protect, admin, getAllFEOs)
  .post(protect, admin, upload.single("profileImage"), createFEO);

router
  .route("/:id")
  .get(protect, admin, getFEOById)
  .put(protect, admin, upload.single("profileImage"), updateFEO)
  .delete(protect, admin, deleteFEO);

export default router;
