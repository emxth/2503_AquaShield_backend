// backend/routes/auth.js
import express from "express";
import passport from "passport";
import {
  registerUser,
  loginUser,
  loginFEO,
  loginAdmin,
  googleCallback,
  facebookCallback,
  getMe,
  googleSignIn, // NEW
} from "../controllers/authController.js";
import {
  forgotPassword,
  resetPassword,
  feoForgotPassword,
  feoResetPassword,
} from "../controllers/passwordResetController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes - NO authentication required
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/feo-login", loginFEO);
router.post("/admin-login", loginAdmin);

// NEW: Mobile Google Sign In
router.post("/google", googleSignIn);

// Password reset routes - User
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);

// Password reset routes - FEO
router.post("/feo-forgot-password", feoForgotPassword);
router.put("/feo-reset-password/:resetToken", feoResetPassword);

// Google OAuth routes (Web - for compatibility)
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

// Facebook OAuth routes
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  facebookCallback
);

// Protected routes - authentication required
router.get("/me", protect, getMe);

export default router;
