import feoModel from "../models/feoModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

//API for feo login
const loginFEO = async(req,res)=>{

    try {
        
        const {email,password} = req.body
        const feo = await feoModel.findOne({email})

        if(!feo){
            return res.json({success: false, message: "Invalid credentials"})
        }

        const isMatch = await bcrypt.compare(password,feo.password)

        if(isMatch){

            const token = jwt.sign({id:feo._id},process.env.JWT_SECRET)

            res.json({success:true,token})
        }else{
            res.json({success: false, message: "Invalid credentials"})
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

//API to get feo profile
const feoProfile = async (req,res)=>{
    try {

        const {feoId} = req.body
        const profileData = await feoModel.findById(feoId).select('-password')
        
        res.json({ success: true, profileData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

//API to update feo profile 
const updateFeoProfile = async (req,res) =>{
    try {

        const {feoId,username,email,officeContact} = req.body

        await feoModel.findByIdAndUpdate(feoId,{username,email,officeContact})

        res.json({success: true, message: "Profile Updated" })

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export {loginFEO,feoProfile,updateFeoProfile}