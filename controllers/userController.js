import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { cloudinary } from "../config/cloudinary.js";
import { sendEmail, emailTemplates } from "../config/email.js";

// @desc    Update user profile (NOW WITH BASE64 SUPPORT)
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  console.log("=== UPDATE PROFILE REQUEST (BASE64) ===");
  console.log("Body keys:", Object.keys(req.body));
  console.log("User ID:", req.user?._id);

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      console.error("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ User found:", user.email);

    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.contactNo = req.body.contactNo || user.contactNo;
    user.address = req.body.address || user.address;

    console.log("📝 Fields updated");

    if (req.body.profileImageBase64) {
      console.log("📷 Processing Base64 image...");
      console.log("Base64 length:", req.body.profileImageBase64.length);

      user.profileImage = {
        base64: req.body.profileImageBase64,
        url: null,
        publicId: null,
      };

      console.log("✅ Base64 image saved to database");
    }

    console.log("💾 Saving user to database...");
    const updatedUser = await user.save();
    console.log("✅ User saved successfully");

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      contactNo: updatedUser.contactNo,
      address: updatedUser.address,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
    });

    console.log("✅ Response sent successfully");
  } catch (error) {
    console.error("=== ERROR IN UPDATE PROFILE ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      message: error.message || "Failed to update profile",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Please provide current and new password");
  }

  if (newPassword.length < 8) {
    res.status(400);
    throw new Error("New password must be at least 8 characters");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  user.markModified("password");
  await user.save();

  console.log("✅ Password changed successfully for user:", user.email);

  res.json({ message: "Password updated successfully" });
});

// @desc    Request account deletion
// @route   POST /api/users/request-deletion
// @desc    Request account deletion
// @route   POST /api/users/request-deletion
// @access  Private
export const requestAccountDeletion = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Only allow new request if not already pending
  if (user.deletionRequested && user.deletionRequestStatus === "pending") {
    res.status(400);
    throw new Error("Account deletion request is already pending");
  }

  user.deletionRequested = true;
  user.deletionRequestStatus = "pending"; // pending by default
  user.deletionRequestedAt = Date.now();
  await user.save();

  res.json({
    success: true,
    message: "Account deletion request submitted successfully",
    deletionRequested: user.deletionRequested,
    deletionRequestStatus: user.deletionRequestStatus,
  });
});

// @desc    Cancel account deletion request
// @route   DELETE /api/users/cancel-deletion-request
// @access  Private
// @desc    Cancel account deletion request
// @route   DELETE /api/users/cancel-deletion-request
// @access  Private
export const cancelDeletionRequest = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Can only cancel if pending
  if (!user.deletionRequested || user.deletionRequestStatus !== "pending") {
    res.status(400);
    throw new Error("No pending deletion request to cancel");
  }

  // ✅ Reset deletion fields
  user.deletionRequested = false;
  user.deletionRequestStatus = null; // <- use null instead of ""
  user.deletionRequestedAt = undefined;
  user.deletionReason = undefined;

  await user.save();

  res.json({
    success: true,
    message: "Account deletion request cancelled",
    deletionRequested: user.deletionRequested,
    deletionRequestStatus: user.deletionRequestStatus,
  });
});

// @desc    Delete user account (immediate - for backward compatibility)
// @route   DELETE /api/users/profile
// @access  Private
export const deleteUserAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Delete profile image from cloudinary if exists
  if (user.profileImage?.publicId) {
    try {
      await cloudinary.uploader.destroy(user.profileImage.publicId);
      console.log("✅ Profile image deleted from Cloudinary");
    } catch (error) {
      console.error("❌ Error deleting image:", error);
    }
  }

  await user.deleteOne();
  res.json({ message: "User account deleted successfully" });
});
