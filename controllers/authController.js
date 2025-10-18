// backend/controllers/authController.js
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import FEO from "../models/FEO.js";
import generateToken from "../utils/tokenGenerator.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  console.log("=== Registration Request Received ===");
  console.log("Request body:", req.body);

  const { firstName, lastName, email, password, contactNo, address } = req.body;

  if (!firstName || !lastName || !email || !password) {
    console.log("Missing required fields");
    res.status(400);
    throw new Error(
      "Please provide all required fields: firstName, lastName, email, password"
    );
  }

  console.log("Checking if user exists with email:", email);
  const userExists = await User.findOne({ email });

  if (userExists) {
    console.log("User already exists with email:", email);
    res.status(400);
    throw new Error("User already exists");
  }

  console.log("Creating new user...");
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    contactNo,
    address,
  })

  if (user) {
    console.log("User created successfully:", user._id);

    const token = generateToken(user._id, "user");

    const response = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      contactNo: user.contactNo,
      address: user.address,
      role: user.role,
      profileImage: user.profileImage,
      token: token,
    };

    console.log("Sending success response");
    res.status(201).json(response);
  } else {
    console.log("Failed to create user");
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  console.log("=== Login Request Received ===");
  const { email, password } = req.body;

  const user = await User.findOne({ email });

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
      contactNo: user.contactNo,
      address: user.address,
      role: user.role,
      profileImage: user.profileImage,
      token: generateToken(user._id, "user"),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Google Sign In (Mobile)
// @route   POST /api/auth/google
// @access  Public
export const googleSignIn = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400);
    throw new Error("ID token is required");
  }

  try {
    // Verify the token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: [
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_ANDROID_CLIENT_ID,
        process.env.GOOGLE_IOS_CLIENT_ID,
      ],
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name, family_name, picture } = payload;

    console.log("Google user verified:", email);

    // Check if user exists with Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with email
      user = await User.findOne({ email });

      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        if (!user.profileImage.url && picture) {
          user.profileImage.url = picture;
        }
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          googleId,
          firstName: given_name || "User",
          lastName: family_name || "",
          email,
          profileImage: {
            url: picture || "",
          },
        });
      }
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error("Account is deactivated");
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      contactNo: user.contactNo,
      address: user.address,
      role: user.role,
      profileImage: user.profileImage,
      token: generateToken(user._id, "user"),
    });
  } catch (error) {
    console.error("Google Sign In Error:", error);
    res.status(401);
    throw new Error("Invalid Google token");
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

// @desc    Google OAuth callback (Web - kept for compatibility)
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = asyncHandler(async (req, res) => {
  const token = generateToken(req.user._id, "user");
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
});

// @desc    Facebook OAuth callback
// @route   GET /api/auth/facebook/callback
// @access  Public
export const facebookCallback = asyncHandler(async (req, res) => {
  const token = generateToken(req.user._id, "user");
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
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

export const loginResearcher = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, role: "researcher" });

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
    throw new Error("Invalid researcher credentials");
  }
});