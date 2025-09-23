import multer from "multer";

const storage = multer.memoryStorage(); // store files in memory
const limits = { fileSize: 5 * 1024 * 1024 }; // 5MB max

const upload = multer({ storage, limits });

export default upload;
