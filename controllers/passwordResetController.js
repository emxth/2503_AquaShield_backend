import asyncHandler from "express-async-handler";
import crypto from "crypto";
import User from "../models/User.js";
import FEO from "../models/FEO.js";
import { sendEmail, emailTemplates } from "../config/email.js";

// @desc    Forgot password - User
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please provide email address");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("No account found with this email address");
  }

  // Check if user has a password (not OAuth user)
  if (!user.password) {
    res.status(400);
    throw new Error(
      "This account uses social login. Please sign in with Google or Facebook."
    );
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL for mobile app
  const resetUrl = `fisheries://reset-password/${resetToken}`;

  // For testing/web, you can also create a web URL
  const webResetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    const emailContent = emailTemplates.resetPassword(
      webResetUrl, // Use webResetUrl for email
      `${user.firstName} ${user.lastName}`
    );

    await sendEmail({
      email: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
      // For mobile app deep linking
      resetToken: resetToken, // Send token so mobile app can handle it
    });
  } catch (error) {
    console.error("Error sending email:", error);

    // Reset token fields if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error("Email could not be sent. Please try again later.");
  }
});

// @desc    Reset password - User
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
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

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  // Set new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.markModified("password");
  await user.save();

  // Send confirmation email
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
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    // Don't throw error if confirmation email fails
  }

  res.status(200).json({
    success: true,
    message:
      "Password reset successful. You can now login with your new password.",
  });
});

// @desc    Forgot password - FEO
// @route   POST /api/auth/feo-forgot-password
// @access  Public
export const feoForgotPassword = asyncHandler(async (req, res) => {
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

  // Generate reset token
  const resetToken = feo.getResetPasswordToken();
  await feo.save({ validateBeforeSave: false });

  // Create reset URL for mobile app
  const resetUrl = `fisheries://feo-reset-password/${resetToken}`;

  // For testing/web
  const webResetUrl = `${process.env.CLIENT_URL}/feo-reset-password/${resetToken}`;

  try {
    const emailContent = emailTemplates.resetPassword(
      webResetUrl,
      feo.fullName
    );

    await sendEmail({
      email: feo.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
      resetToken: resetToken, // For mobile app
    });
  } catch (error) {
    console.error("Error sending email:", error);

    feo.resetPasswordToken = undefined;
    feo.resetPasswordExpire = undefined;
    await feo.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error("Email could not be sent. Please try again later.");
  }
});

// @desc    Reset password - FEO
// @route   PUT /api/auth/feo-reset-password/:resetToken
// @access  Public
export const feoResetPassword = asyncHandler(async (req, res) => {
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

  // Get hashed token
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

  // Set new password
  feo.password = newPassword;
  feo.resetPasswordToken = undefined;
  feo.resetPasswordExpire = undefined;
  feo.markModified("password");
  await feo.save();

  // Send confirmation email
  try {
    const emailContent = emailTemplates.passwordResetSuccess(feo.fullName);

    await sendEmail({
      email: feo.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }

  res.status(200).json({
    success: true,
    message:
      "Password reset successful. You can now login with your new password.",
  });
});
