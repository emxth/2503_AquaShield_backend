import multer from "multer";

const storage = multer.diskStorage({});
const uploadMulter = multer({ storage });

export { uploadMulter };