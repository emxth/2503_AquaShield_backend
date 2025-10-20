import express from "express";
import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import { protect, admin } from "../middleware/auth.js";
import { cloudinary } from "../config/cloudinary.js";

const router = express.Router();

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get(
  "/users",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      count: users.length,
      users,
    });
  })
);

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get(
  "/users/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");

    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

// @desc    Get deletion requests (ALL - pending, approved, rejected)
// @route   GET /api/admin/deletion-requests
// @access  Private/Admin
router.get(
  "/deletion-requests",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { status } = req.query; // Optional filter: 'pending', 'approved', 'rejected', or 'all'

    let query = {
      role: "user",
      deletionRequested: true,
    };

    // Add status filter if provided
    if (status && status !== "all") {
      query.deletionRequestStatus = status;
    }

    const deletionRequests = await User.find(query)
      .select("-password")
      .populate("deletionProcessedBy", "firstName lastName email")
      .sort({ deletionRequestedAt: -1 });

    // Count by status
    const pendingCount = await User.countDocuments({
      role: "user",
      deletionRequested: true,
      deletionRequestStatus: "pending",
    });

    const approvedCount = await User.countDocuments({
      role: "user",
      deletionRequested: true,
      deletionRequestStatus: "approved",
    });

    const rejectedCount = await User.countDocuments({
      role: "user",
      deletionRequested: true,
      deletionRequestStatus: "rejected",
    });

    res.json({
      count: deletionRequests.length,
      requests: deletionRequests,
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: deletionRequests.length,
      },
    });
  })
);

// @desc    Approve deletion request (mark as approved, DON'T delete yet)
// @route   PUT /api/admin/users/:id/approve-deletion
// @access  Private/Admin
router.put(
  "/users/:id/approve-deletion",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (user.role === "admin") {
      res.status(400);
      throw new Error("Cannot delete admin user");
    }

    if (!user.deletionRequested) {
      res.status(400);
      throw new Error("No deletion request found for this user");
    }

    if (user.deletionRequestStatus !== "pending") {
      res.status(400);
      throw new Error(
        `This request has already been ${user.deletionRequestStatus}`
      );
    }

    // Mark as approved but don't delete
    user.deletionRequestStatus = "approved";
    user.deletionProcessedAt = Date.now();
    user.deletionProcessedBy = req.user._id;
    user.isActive = false; // Deactivate account

    await user.save();

    const userName = `${user.firstName} ${user.lastName}`;
    const userEmail = user.email;

    console.log(`✅ User deletion request approved: ${userEmail}`);

    res.json({
      message: `Deletion request for ${userName} (${userEmail}) has been approved. Account is now deactivated.`,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        deletionRequestStatus: user.deletionRequestStatus,
        deletionProcessedAt: user.deletionProcessedAt,
      },
    });
  })
);

// @desc    Reject deletion request
// @route   PUT /api/admin/users/:id/reject-deletion
// @access  Private/Admin
router.put(
  "/users/:id/reject-deletion",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (!user.deletionRequested) {
      res.status(400);
      throw new Error("No deletion request found for this user");
    }

    if (user.deletionRequestStatus !== "pending") {
      res.status(400);
      throw new Error(
        `This request has already been ${user.deletionRequestStatus}`
      );
    }

    // Mark as rejected (keep the request record)
    user.deletionRequestStatus = "rejected";
    user.deletionProcessedAt = Date.now();
    user.deletionProcessedBy = req.user._id;

    await user.save();

    res.json({
      message: "Deletion request rejected successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        deletionRequestStatus: user.deletionRequestStatus,
        deletionProcessedAt: user.deletionProcessedAt,
      },
    });
  })
);

// @desc    Permanently delete user (admin direct action)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete(
  "/users/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === "admin") {
        res.status(400);
        throw new Error("Cannot delete admin user");
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
      res.json({ message: "User removed permanently" });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get(
  "/stats",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalFEOs = await User.countDocuments({ role: "feo" });
    const activeUsers = await User.countDocuments({
      role: "user",
      isActive: true,
    });
    const pendingDeletions = await User.countDocuments({
      role: "user",
      deletionRequested: true,
      deletionRequestStatus: "pending",
    });

    res.json({
      totalUsers,
      totalFEOs,
      activeUsers,
      pendingDeletions,
    });
  })
);

export default router;
