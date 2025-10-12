import asyncHandler from "express-async-handler";
import FEO from "../models/FEO.js";
import { cloudinary } from "../config/cloudinary.js";

// @desc    Create FEO
// @route   POST /api/feo
// @access  Private/Admin
export const createFEO = asyncHandler(async (req, res) => {
  console.log("=== Create FEO Request ===");
  console.log("Body:", req.body);
  console.log("File:", req.file);

  const {
    fullName,
    department,
    designation,
    employeeId,
    assignedArea,
    nicNo,
    email,
    officeContact,
    password,
  } = req.body;

  // Validate required fields
  if (
    !fullName ||
    !department ||
    !designation ||
    !employeeId ||
    !assignedArea ||
    !nicNo ||
    !email ||
    !officeContact ||
    !password
  ) {
    console.log("Missing required fields");
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Check if FEO exists
  const feoExists = await FEO.findOne({
    $or: [{ email }, { employeeId }, { nicNo }],
  });

  if (feoExists) {
    console.log("FEO already exists");
    res.status(400);
    throw new Error("FEO with this email, employee ID, or NIC already exists");
  }

  // Validate password length
  if (password.length < 8) {
    console.log("Password too short");
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  const feoData = {
    fullName,
    department,
    designation,
    employeeId,
    assignedArea,
    nicNo,
    email,
    officeContact,
    password,
    createdBy: req.user._id,
  };

  // Handle profile image upload
  if (req.file) {
    console.log("📁 File uploaded:", req.file);
    feoData.profileImage = {
      url: req.file.path,
      publicId: req.file.filename,
    };
    console.log("✅ Image saved:", feoData.profileImage);
  }

  console.log("Creating FEO with data:", { ...feoData, password: "[HIDDEN]" });

  const feo = await FEO.create(feoData);

  if (feo) {
    console.log("✅ FEO created successfully:", feo._id);
    res.status(201).json({
      _id: feo._id,
      fullName: feo.fullName,
      department: feo.department,
      designation: feo.designation,
      employeeId: feo.employeeId,
      assignedArea: feo.assignedArea,
      nicNo: feo.nicNo,
      email: feo.email,
      officeContact: feo.officeContact,
      profileImage: feo.profileImage,
      message: "FEO created successfully",
    });
  } else {
    console.log("Failed to create FEO");
    res.status(400);
    throw new Error("Invalid FEO data");
  }
});

// @desc    Get all FEOs
// @route   GET /api/feo
// @access  Private/Admin
export const getAllFEOs = asyncHandler(async (req, res) => {
  const { department, search } = req.query;

  let query = {};

  if (department && department !== "All") {
    query.department = department;
  }

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { employeeId: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const feos = await FEO.find(query)
    .select("-password")
    .populate("createdBy", "firstName lastName email")
    .sort({ createdAt: -1 });

  res.json({
    count: feos.length,
    feos,
  });
});

// @desc    Get FEO by ID
// @route   GET /api/feo/:id
// @access  Private/Admin
export const getFEOById = asyncHandler(async (req, res) => {
  const feo = await FEO.findById(req.params.id)
    .select("-password")
    .populate("createdBy", "firstName lastName email");

  if (feo) {
    res.json(feo);
  } else {
    res.status(404);
    throw new Error("FEO not found");
  }
});

// @desc    Update FEO
// @route   PUT /api/feo/:id
// @access  Private/Admin
export const updateFEO = asyncHandler(async (req, res) => {
  const feo = await FEO.findById(req.params.id);

  if (!feo) {
    res.status(404);
    throw new Error("FEO not found");
  }

  // Update fields
  feo.fullName = req.body.fullName || feo.fullName;
  feo.department = req.body.department || feo.department;
  feo.designation = req.body.designation || feo.designation;
  feo.employeeId = req.body.employeeId || feo.employeeId;
  feo.assignedArea = req.body.assignedArea || feo.assignedArea;
  feo.nicNo = req.body.nicNo || feo.nicNo;
  feo.email = req.body.email || feo.email;
  feo.officeContact = req.body.officeContact || feo.officeContact;

  // Handle profile image upload
  if (req.file) {
    console.log("📁 File uploaded:", req.file);

    // Delete old image from cloudinary if exists
    if (feo.profileImage?.publicId) {
      try {
        await cloudinary.uploader.destroy(feo.profileImage.publicId);
        console.log("✅ Old image deleted from Cloudinary");
      } catch (error) {
        console.error("❌ Error deleting old image:", error);
      }
    }

    feo.profileImage = {
      url: req.file.path,
      publicId: req.file.filename,
    };
    console.log("✅ New image saved:", feo.profileImage);
  }

  // Update password if provided
  if (req.body.password) {
    if (req.body.password.length < 8) {
      res.status(400);
      throw new Error("Password must be at least 8 characters");
    }
    feo.password = req.body.password;
  }

  const updatedFEO = await feo.save();

  res.json({
    _id: updatedFEO._id,
    fullName: updatedFEO.fullName,
    department: updatedFEO.department,
    designation: updatedFEO.designation,
    employeeId: updatedFEO.employeeId,
    assignedArea: updatedFEO.assignedArea,
    nicNo: updatedFEO.nicNo,
    email: updatedFEO.email,
    officeContact: updatedFEO.officeContact,
    profileImage: updatedFEO.profileImage,
    message: "FEO updated successfully",
  });
});

// @desc    Delete FEO
// @route   DELETE /api/feo/:id
// @access  Private/Admin
export const deleteFEO = asyncHandler(async (req, res) => {
  const feo = await FEO.findById(req.params.id);

  if (!feo) {
    res.status(404);
    throw new Error("FEO not found");
  }

  // Delete profile image from cloudinary if exists
  if (feo.profileImage?.publicId) {
    try {
      await cloudinary.uploader.destroy(feo.profileImage.publicId);
      console.log("✅ Profile image deleted from Cloudinary");
    } catch (error) {
      console.error("❌ Error deleting image:", error);
    }
  }

  await feo.deleteOne();
  res.json({ message: "FEO removed successfully" });
});

// @desc    Get FEO profile
// @route   GET /api/feo/profile/me
// @access  Private (FEO)
export const getFEOProfile = asyncHandler(async (req, res) => {
  const feo = await FEO.findById(req.user._id).select("-password");

  if (feo) {
    res.json(feo);
  } else {
    res.status(404);
    throw new Error("FEO not found");
  }
});

// @desc    Update FEO profile (self)
// @route   PUT /api/feo/profile/me
// @access  Private (FEO)
export const updateFEOProfile = asyncHandler(async (req, res) => {
  const feo = await FEO.findById(req.user._id);

  if (!feo) {
    res.status(404);
    throw new Error("FEO not found");
  }

  feo.fullName = req.body.fullName || feo.fullName;
  feo.officeContact = req.body.officeContact || feo.officeContact;

  // Handle profile image upload
  if (req.file) {
    console.log("📁 File uploaded:", req.file);

    // Delete old image from cloudinary if exists
    if (feo.profileImage?.publicId) {
      try {
        await cloudinary.uploader.destroy(feo.profileImage.publicId);
        console.log("✅ Old image deleted from Cloudinary");
      } catch (error) {
        console.error("❌ Error deleting old image:", error);
      }
    }

    feo.profileImage = {
      url: req.file.path,
      publicId: req.file.filename,
    };
    console.log("✅ New image saved:", feo.profileImage);
  }

  const updatedFEO = await feo.save();

  res.json({
    _id: updatedFEO._id,
    fullName: updatedFEO.fullName,
    email: updatedFEO.email,
    department: updatedFEO.department,
    designation: updatedFEO.designation,
    employeeId: updatedFEO.employeeId,
    assignedArea: updatedFEO.assignedArea,
    nicNo: updatedFEO.nicNo,
    officeContact: updatedFEO.officeContact,
    profileImage: updatedFEO.profileImage,
    message: "Profile updated successfully",
  });
});

// @desc    Change FEO password
// @route   PUT /api/feo/profile/change-password
// @access  Private (FEO)
export const changeFEOPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Please provide current and new password");
  }

  if (newPassword.length < 8) {
    res.status(400);
    throw new Error("New password must be at least 8 characters");
  }

  const feo = await FEO.findById(req.user._id);

  if (!feo) {
    res.status(404);
    throw new Error("FEO not found");
  }

  const isMatch = await feo.matchPassword(currentPassword);

  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  feo.password = newPassword;
  await feo.save();

  res.json({ message: "Password updated successfully" });
});
