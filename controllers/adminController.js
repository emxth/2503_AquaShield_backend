import validator from "validator";
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from "cloudinary";
import feoModel from "../models/feoModel.js";
import jwt from 'jsonwebtoken'

// API for adding FEO
const addfeo = async (req, res) => {
  try {
    const {
      fullname,
      username,
      department,
      designation,
      employeeId,
      assignedArea,
      nicNo,
      email,
      officeContact,
      password,
      isActive,
      date
    } = req.body;

    // Get image files
    const photoFile = req.files['photo']?.[0];
    const officeIdFile = req.files['officeId']?.[0];

    // ✅ Debug: log uploaded files
    console.log('photoFile:', photoFile);
    console.log('officeIdFile:', officeIdFile);

    // Check required fields
    if (
      !fullname || !username || !department || !designation || !employeeId ||
      !assignedArea || !nicNo || !email || !officeContact || !password ||
      !isActive || !date || !photoFile || !officeIdFile
    ) {
      return res.status(400).json({ success: false, message: "Missing details or images" });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Please enter a strong password" });
    }

    // ✅ Check if user already exists
    const existingFeo = await feoModel.findOne({
      $or: [{ username }, { email }, { nicNo }]
    });
    if (existingFeo) {
      return res.status(400).json({ success: false, message: 'Username, Email or NIC already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Upload to Cloudinary
    const photoUpload = await cloudinary.uploader.upload(photoFile.path, { resource_type: "image" });
    const officeIdUpload = await cloudinary.uploader.upload(officeIdFile.path, { resource_type: "image" });

    const photoUrl = photoUpload.secure_url;
    const officeIdUrl = officeIdUpload.secure_url;

    // Create new FEO
    const feoData = {
      photo: photoUrl,
      fullname,
      username,
      department,
      designation,
      employeeId,
      assignedArea,
      nicNo,
      email,
      officeContact,
      password: hashedPassword,
      officeId: officeIdUrl,
      isActive: isActive === 'true',
      date: date || Date.now()
    };

    const newFeo = new feoModel(feoData);
    await newFeo.save();

    res.json({ success: true, message: "FEO Added" });

  } catch (error) {
    console.error("Add FEO Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API for admin login
const loginAdmin = async (req,res)=>{
    try{
        const {email,password} = req.body

        if(email == process.env.ADMIN_EMAIL && password == process.env.ADMIN_PASSWORD){
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
        res.status(500).json({ success: false, message: error.message });
    }
}

export { addfeo,loginAdmin,allFEOs };
