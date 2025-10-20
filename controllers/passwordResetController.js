// backend/controllers/passwordResetController.js
import asyncHandler from "express-async-handler";
import crypto from "crypto";
import User from "../models/User.js";
import FEO from "../models/FEO.js";
import { sendEmail, emailTemplates } from "../config/email.js";

// @desc    Forgot password - User
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  console.log("=== FORGOT PASSWORD REQUEST ===");

  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please provide email address");
  }

  console.log("🔍 Looking for user:", email);
  const user = await User.findOne({ email });

  if (!user) {
    console.log("❌ User not found");
    res.status(404);
    throw new Error("No account found with this email address");
  }

  console.log("✅ User found:", user.email);

  // Generate reset token
  console.log("🔑 Generating reset token...");
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  console.log("✅ Token saved");

  // ✅ UPDATED: Create WEB reset URL instead of app deep link
  const resetUrl = `${
    process.env.FRONTEND_URL || "http://localhost:5001"
  }/reset-password?token=${resetToken}&type=user`;

  console.log("🔗 Reset URL:", resetUrl);

  try {
    console.log("📧 Preparing email...");

    const emailContent = emailTemplates.resetPassword(
      resetUrl,
      `${user.firstName} ${user.lastName}`
    );

    console.log("📤 Sending email to:", user.email);
    await sendEmail({
      email: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log("✅ Email sent successfully!");

    res.status(200).json({
      success: true,
      message:
        "Password reset email sent successfully. Please check your inbox and click the link to reset your password.",
    });
  } catch (error) {
    console.error("❌ Error:", error.message);

    // Clear token on error
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
});

// @desc    Reset password - User
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  console.log("=== RESET PASSWORD ===");

  const { newPassword } = req.body;
  const { resetToken } = req.params;

  if (!newPassword) {
    res.status(400);
    throw new Error("Please provide new password");
  }

  if (newPassword.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  // Hash token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log("🔍 Looking for valid token...");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    console.log("❌ Invalid or expired token");
    res.status(400);
    throw new Error(
      "Invalid or expired reset token. Please request a new password reset."
    );
  }

  console.log("✅ Valid token for:", user.email);

  // Update password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.markModified("password");
  await user.save();

  console.log("✅ Password updated");

  // Send confirmation
  try {
    const emailContent = emailTemplates.passwordResetSuccess(
      `${user.firstName} ${user.lastName}`
    );

    await sendEmail({
      email: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log("✅ Confirmation email sent");
  } catch (error) {
    console.error(
      "⚠️ Confirmation email failed (non-critical):",
      error.message
    );
  }

  res.status(200).json({
    success: true,
    message:
      "Password reset successful! You can now login with your new password in the app.",
  });
});

// @desc    Forgot password - FEO
// @route   POST /api/auth/feo-forgot-password
// @access  Public
export const feoForgotPassword = asyncHandler(async (req, res) => {
  console.log("=== FEO FORGOT PASSWORD ===");

  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please provide email address");
  }

  const feo = await FEO.findOne({ email });

  if (!feo) {
    res.status(404);
    throw new Error("No FEO account found with this email address");
  }

  const resetToken = feo.getResetPasswordToken();
  await feo.save({ validateBeforeSave: false });

  // ✅ UPDATED: Create WEB reset URL for FEO
  const resetUrl = `${
    process.env.FRONTEND_URL || "http://localhost:5001"
  }/reset-password?token=${resetToken}&type=feo`;

  try {
    const emailContent = emailTemplates.resetPassword(resetUrl, feo.fullName);

    await sendEmail({
      email: feo.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    res.status(200).json({
      success: true,
      message:
        "Password reset email sent successfully. Please check your inbox.",
    });
  } catch (error) {
    feo.resetPasswordToken = undefined;
    feo.resetPasswordExpire = undefined;
    await feo.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
});

// @desc    Reset password - FEO
// @route   PUT /api/auth/feo-reset-password/:resetToken
// @access  Public
export const feoResetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const { resetToken } = req.params;

  if (!newPassword || newPassword.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const feo = await FEO.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!feo) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  feo.password = newPassword;
  feo.resetPasswordToken = undefined;
  feo.resetPasswordExpire = undefined;
  feo.markModified("password");
  await feo.save();

  try {
    const emailContent = emailTemplates.passwordResetSuccess(feo.fullName);

    await sendEmail({
      email: feo.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
  } catch (error) {
    console.error("⚠️ Confirmation email failed");
  }

  res.status(200).json({
    success: true,
    message:
      "Password reset successful! You can now login with your new password in the app.",
  });
});
