import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../utils/cloudinary.js";


const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        let resourceType = "image";
        if (file.mimetype.startsWith("video")) {
            resourceType = "video";
        }
        return {
            folder: "evidence",
            resource_type: resourceType,
            allowed_formats: ["jpg", "jpeg", "png", "mp4", "mov"],
        };
    },
});
const uploadMulter = multer({ storage });

export { uploadMulter };