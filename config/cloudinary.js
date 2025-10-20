// import { v2 as cloudinary } from 'cloudinary'

// const connectCloudinary = async () => {

//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_SECRET_KEY
//   })
// }

// export default connectCloudinary;

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Verify required environment variables
if (
  !process.env.CLOUDINARY_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_SECRET_KEY
) {
  console.error("❌ ERROR: Cloudinary environment variables are not set!");
  console.error(
    "Please set: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
  );
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

console.log("✅ Cloudinary configured:", process.env.CLOUDINARY_NAME);

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "fisheries_profiles",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
    public_id: (req, file) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return `profile_${uniqueSuffix}`;
    },
  },
});

// Configure multer with detailed error handling
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    console.log("📋 File filter check:", {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.mimetype)) {
      console.error("❌ Invalid file type:", file.mimetype);
      return cb(new Error("Only JPEG, JPG, and PNG images are allowed"), false);
    }

    console.log("✅ File type valid");
    cb(null, true);
  },
});

export { cloudinary, upload };
