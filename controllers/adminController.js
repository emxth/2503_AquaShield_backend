import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import feoModel from "../models/feoModel.js";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import accountDeletionModel from "../models/accountDeletionModel.js";

// API for adding FEO
const addfeo = async (req, res) => {
  try {
    const {
      fullname,
      department,
      designation,
      employeeId,
      assignedArea,
      nicNo,
      email,
      officeContact,
      password,
      date,
    } = req.body;

    // ✅ multer puts the file here
    const imageFile = req.file;

    if (!imageFile) {
      return res.json({ success: false, message: "Photo is required" });
    }

    // Check required fields
    if (
      !fullname ||
      !department ||
      !designation ||
      !employeeId ||
      !assignedArea ||
      !nicNo ||
      !email ||
      !officeContact ||
      !password
    ) {
      return res.json({ success: false, message: "Missing details" });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // Check for existing FEO
    const existingFeo = await feoModel.findOne({ $or: [{ email }, { nicNo }] });
    if (existingFeo) {
      return res
        .status(400)
        .json({ success: false, message: "Email or NIC already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Upload to Cloudinary
    const photoUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const photoUrl = photoUpload.secure_url;

    // Create new FEO
    const feoData = {
      image: photoUrl,
      fullname,
      department,
      designation,
      employeeId,
      assignedArea,
      nicNo,
      email,
      officeContact,
      password: hashedPassword,
      date: date || Date.now(),
    };

    const newFeo = new feoModel(feoData);
    await newFeo.save();

    res.json({ success: true, message: "FEO Added" });
  } catch (error) {
    console.error("Add FEO Error:", error);
    res.json({ success: false, message: error.message });
  }
};

//API for admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API to get all FEO list for admin panel
const allFEOs = async (req, res) => {
  try {
    const feos = await feoModel.find({}).select("-password");
    res.json({ success: true, feos });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// GET all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    res.json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all account deletion requests
const getAllAccountDeletions = async (req, res) => {
  try {
    const requests = await accountDeletionModel
      .find()
      .sort({ requestedDate: -1 });
    res.json({ success: true, deletions: requests }); // ✅ fixed
  } catch (error) {
    console.error("Error fetching deletions:", error);
    res.json({ success: false, message: error.message });
  }
};

// Update account deletion status (accept/reject)
const updateDeletionStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status)
      return res
        .status(400)
        .json({ success: false, message: "Missing id or status" });

    const request = await accountDeletionModel.findById(id);
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });

    request.status = status;

    // ✅ Only delete the user if accepted
    if (status.toLowerCase() === "accepted") {
      const user = await userModel.findById(request.userId);
      if (user) await user.remove(); // triggers Mongoose middleware
    }

    await request.save(); // Save status change in admin table

    res.json({ success: true, message: `Request ${status} successfully` });
  } catch (error) {
    console.error("Update Deletion Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Permanently delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });

    const user = await userModel.findById(id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    await user.deleteOne(); // permanently delete user
    res.json({ success: true, message: "User permanently deleted" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFEO = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullname,
      department,
      designation,
      employeeId,
      assignedArea,
      nicNo,
      email,
      officeContact,
      password,
    } = req.body;

    const feo = await feoModel.findById(id);
    if (!feo)
      return res.status(404).json({ success: false, message: "FEO not found" });

    if (email && !validator.isEmail(email))
      return res.status(400).json({ success: false, message: "Invalid email" });

    let hashedPassword = feo.password;
    if (password) {
      if (password.length < 8)
        return res
          .status(400)
          .json({ success: false, message: "Password too short" });
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
      });
      feo.image = uploadResult.secure_url;
    }

    feo.fullname = fullname || feo.fullname;
    feo.department = department || feo.department;
    feo.designation = designation || feo.designation;
    feo.employeeId = employeeId || feo.employeeId;
    feo.assignedArea = assignedArea || feo.assignedArea;
    feo.nicNo = nicNo || feo.nicNo;
    feo.email = email || feo.email;
    feo.officeContact = officeContact || feo.officeContact;
    feo.password = hashedPassword;

    await feo.save();
    res.json({ success: true, message: "FEO updated successfully", feo });
  } catch (error) {
    console.error("Update FEO Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFEO = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "FEO ID is required" });

    const feo = await feoModel.findById(id);
    if (!feo)
      return res.status(404).json({ success: false, message: "FEO not found" });

    await feo.deleteOne(); // permanently delete FEO
    res.json({ success: true, message: "FEO deleted successfully" });
  } catch (error) {
    console.error("Delete FEO Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  addfeo,
  loginAdmin,
  allFEOs,
  getAllUsers,
  getAllAccountDeletions,
  updateDeletionStatus,
  deleteUser,
  updateFEO,
  deleteFEO,
};
