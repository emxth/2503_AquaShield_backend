import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import accountDeletionModel from "../models/accountDeletionModel.js";

//API tO register user
const registerUser = async(req,res) =>{
    try {
        const {firstname,lastname,email,password}=req.body

        if(!firstname || !lastname || !email || !password){
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

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            firstname,
            lastname,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        
        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)

        res.json({success:true,token})

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
} 

//API for user login
const loginUser = async(req,res)=>{
    try {
        
        const {email,password} = req.body
        const user = await userModel.findOne({email})
        
        if(!user){
            return res.json({success: false, message: 'User does not exist' })
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(isMatch){
            const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
            res.json({success:true,token})
        }else{
            res.json({ success: false, message: "Invalid credentials" });
        }
        
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

//API to get user profile data
const getProfile = async(req,res)=>{

    try {
        
        const userData = await userModel.findById(req.userId).select('-password')

        if (!userData) {
  return res.status(404).json({ success: false, message: "User not found or deleted" });
}

        res.json({ success: true, userData });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

//API to update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstname, lastname, contactNo, email, address } = req.body;
    const imageFile = req.file;

    if (!firstname || !lastname || !contactNo || !email || !address) {
      return res.json({ success: false, message: 'Data missing' });
    }

    let updateData = {
      firstname,
      lastname,
      contactNo,
      email,
      address: JSON.parse(address)
    };

    if (imageFile) {
      const uploadRes = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      updateData.image = uploadRes.secure_url;
    }

    const updatedUser = await userModel.findByIdAndUpdate(req.userId, updateData, { new: true }).select("-password");

    res.json({ success: true, message: "Profile Updated", userData: updatedUser });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Request account deletion
const requestAccountDeletion = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("firstname lastname email");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Prevent duplicate requests
    const existingRequest = await accountDeletionModel.findOne({ email: user.email, status: "Pending" });
    if (existingRequest) {
      return res.json({ success: false, message: "Deletion request already submitted" });
    }

    const newRequest = new accountDeletionModel({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email
    });

    await newRequest.save();
    res.json({ success: true, message: "Account deletion request submitted" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


export {registerUser,loginUser,getProfile,updateProfile,requestAccountDeletion}