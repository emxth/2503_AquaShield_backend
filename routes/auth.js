// backend/routes/auth.js
import express from "express";
import {
  registerUser,
  loginUser,
  loginFEO,
  loginAdmin,
  getMe,
} from "../controllers/authController.js";
import {
  forgotPassword,
  resetPassword,
  feoForgotPassword,
  feoResetPassword,
} from "../controllers/passwordResetController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/feo-login", loginFEO);
router.post("/admin-login", loginAdmin);

// Password reset routes - User (MUST BE BEFORE OTHER ROUTES)
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);

// Password reset routes - FEO
router.post("/feo-forgot-password", feoForgotPassword);
router.put("/feo-reset-password/:resetToken", feoResetPassword);

// Protected routes
router.get("/me", protect, getMe);

export default router;
