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
const feoProfile = async (req, res) => {
  try {
    const feoId = req.feoId;   // 👈 use req.feoId, not req.body
    const profileData = await feoModel.findById(feoId).select('-password');
    res.json({ success: true, profileData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


//API to update feo profile 
const updateFeoProfile = async (req, res) => {
  try {
    const feoId = req.feoId;   // 👈 take from middleware

    const { email, officeContact } = req.body;

    // Build update object
    const updateData = { email, officeContact };

    // ✅ If new image uploaded, update it
    if (req.file) {
      const photoUpload = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
      });
      updateData.image = photoUpload.secure_url;
    }

    await feoModel.findByIdAndUpdate(feoId, updateData);

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.error("Update FEO Profile Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API to get all FEO list for feo panel
const allFEOsforFEO = async (req,res)=>{
    try {
        const feos = await feoModel.find({}).select('-password')
        res.json({success: true, feos})
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export {loginFEO,feoProfile,updateFeoProfile,allFEOsforFEO}