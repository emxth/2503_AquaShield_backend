<<<<<<< HEAD
import {v2 as cloudinary} from 'cloudinary'

const connectCloudinary = async () =>{
=======
import { v2 as cloudinary } from 'cloudinary'
import dotenv from "dotenv";

const connectCloudinary = async () => {
  dotenv.config();
>>>>>>> 0755a86 (modify report route)

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
  })
}

export default connectCloudinary