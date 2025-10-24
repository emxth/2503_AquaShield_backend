import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import accountDeletionModel from "../models/accountDeletionModel.js";

// Register user
const registerUser = async (req, res) => {
  try {
    const { firstname, lastname, email, contactNo, password, address } =
      req.body; // include address

    if (!firstname || !lastname || !email || !contactNo || !password) {
      return res.json({ success: false, message: "Missing details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Password too short" });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      await bcrypt.genSalt(10)
    );

    const newUser = new userModel({
      firstname,
      lastname,
      email,
      contactNo,
      password: hashedPassword,
      address: address || "", // set address if provided, else empty string
    });

    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get profile
const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, userData: user });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { firstname, lastname, contactNo, email, address } = req.body;
    const imageFile = req.file;

    if (!firstname || !lastname || !contactNo || !email) {
      return res.json({ success: false, message: "Data missing" });
    }

    const updateData = {
      firstname,
      lastname,
      contactNo,
      email,
      address: address || "", // keep as string
    };

    if (imageFile) {
      const uploadRes = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      updateData.image = uploadRes.secure_url;
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(req.userId, updateData, { new: true })
      .select("-password");

    res.json({
      success: true,
      message: "Profile Updated",
      userData: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.json({ success: false, message: "Missing password fields" });

    const user = await userModel.findById(req.userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.json({
        success: false,
        message: "Current password is incorrect",
      });

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword)
      return res.json({
        success: false,
        message: "New password cannot be same as current",
      });

    user.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Request account deletion
const requestAccountDeletion = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.userId)
      .select("firstname lastname email");
    if (!user) return res.json({ success: false, message: "User not found" });

    const existingRequest = await accountDeletionModel.findOne({
      email: user.email,
      status: "Pending",
    });
    if (existingRequest)
      return res.json({
        success: false,
        message: "Deletion request already submitted",
      });

    const newRequest = new accountDeletionModel({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    });
    await newRequest.save();

    res.json({ success: true, message: "Account deletion request submitted" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Check deletion request
const checkDeletionRequest = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("email");
    if (!user) return res.json({ success: false, message: "User not found" });

    const existingRequest = await accountDeletionModel
      .findOne({ email: user.email })
      .sort({ createdAt: -1 });
    const status = existingRequest ? existingRequest.status : null;

    res.json({
      success: true,
      hasPendingRequest: status === "Pending",
      status,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  requestAccountDeletion,
  checkDeletionRequest,
};
