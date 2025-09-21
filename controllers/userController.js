import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'

//API tO register user
const registerUser = async(req,res) =>{
    try {
        const {firstname,lastname,username,contactNo,email,address,password}=req.body

        if(!firstname || !lastname || !username || !contactNo || !email || !address || !password){
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
            username,
            contactNo,
            email,
            address,
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
        res.status(500).json({ success: false, message: error.message });
    }
}

//API to get user profile data
const getProfile = async(req,res)=>{

    try {
        
        const {userId} = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

//API to update user profile
const updateProfile = async (req,res) =>{
    try {

        const {userId,firstname,lastname,username,contactNo,email,address} = req.body
        const imageFile = req.file

        if(!firstname || !lastname || !username || !contactNo || !email || !address){
            return res.json({success: false, message: 'Data missing' })
        }

        await userModel.findByIdAndUpdate(userId,{firstname,lastname,username,contactNo,email,address:JSON.parse(address)})
        
        if(imageFile){
            //Upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId,{image:imageURL})
        }

        res.json({success: true, message: "Profile Updated" })

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export {registerUser,loginUser,getProfile,updateProfile}