// backend/controllers/authController.js
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import FEO from "../models/FEO.js";
import generateToken from "../utils/tokenGenerator.js";

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
// In your registerUser function, add this:
export const registerUser = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, email, password, contactNo, address } =
      req.body;

    console.log("Registration attempt for:", email);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      contactNo,
      address,
      profileImage: {},
    });

    if (user) {
      const token = generateToken(user._id, "user");
      console.log("Token generated for user:", user._id);

      res.status(201).json({
        success: true,
        token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          contactNo: user.contactNo,
          address: user.address,
          role: user.role,
          profileImage: user.profileImage,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid user data",
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during registration",
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  console.log("=== Login Request Received ===");
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    const token = generateToken(user._id, "user");

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contactNo: user.contactNo,
        address: user.address,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }
});

// @desc    Login FEO
// @route   POST /api/auth/feo-login
// @access  Public
export const loginFEO = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const feo = await FEO.findOne({ email });

  if (feo && (await feo.matchPassword(password))) {
    if (!feo.isActive) {
      res.status(403);
      throw new Error("Account is deactivated");
    }

    res.json({
      _id: feo._id,
      fullName: feo.fullName,
      email: feo.email,
      department: feo.department,
      designation: feo.designation,
      employeeId: feo.employeeId,
      assignedArea: feo.assignedArea,
      nicNo: feo.nicNo,
      officeContact: feo.officeContact,
      profileImage: feo.profileImage,
      userType: "feo",
      token: generateToken(feo._id, "feo"),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Admin login
// @route   POST /api/auth/admin-login
// @access  Public
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, role: "admin" });

  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      res.status(403);
      throw new Error("Account is deactivated");
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      token: generateToken(user._id, "user"),
    });
  } else {
    res.status(401);
    throw new Error("Invalid admin credentials");
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.userType === "feo") {
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      department: user.department,
      designation: user.designation,
      employeeId: user.employeeId,
      assignedArea: user.assignedArea,
      nicNo: user.nicNo,
      officeContact: user.officeContact,
      profileImage: user.profileImage,
      userType: "feo",
    });
  } else {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      contactNo: user.contactNo,
      address: user.address,
      role: user.role,
      profileImage: user.profileImage,
      userType: "user",
    });
  }
});
