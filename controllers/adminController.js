import validator from "validator";
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from "cloudinary";
import feoModel from "../models/feoModel.js";
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";

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
      date
    } = req.body;

    // ✅ multer puts the file here
    const imageFile = req.file;

    if (!imageFile) {
      return res.json({ success: false, message: "Photo is required" });
    }

    // Check required fields
    if (!fullname || !department || !designation || !employeeId || !assignedArea || !nicNo || !email || !officeContact || !password) {
      return res.json({ success: false, message: "Missing details" });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password" });
    }

    // Check for existing FEO
    const existingFeo = await feoModel.findOne({ $or: [{ email }, { nicNo }] });
    if (existingFeo) {
      return res.status(400).json({ success: false, message: 'Email or NIC already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Upload to Cloudinary
    const photoUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
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
      date: date || Date.now()
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
const loginAdmin = async (req,res)=>{
    try{
        const {email,password} = req.body

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password,process.env.JWT_SECRET)
            res.json({success:true,token})

        }else{
            res.json({success: false, message: "Invalid credentials"})
        }

    }catch{
     console.error(error);
     res.status(500).json({ success: false, message: error.message });
    }
}

//API to get all FEO list for admin panel
const allFEOs = async (req,res)=>{
    try {
        const feos = await feoModel.find({}).select('-password')
        res.json({success: true, feos})
        
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}


// GET all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password")
    res.json({ success: true, users })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export { addfeo,loginAdmin,allFEOs,getAllUsers };
