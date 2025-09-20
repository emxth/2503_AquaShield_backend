import { Router } from "express";
import { uploadMulter } from "../middleware/uploadMulter.js";
import { createNewReport } from "../controller/reportController.js";

const router = Router();

router.post("/create", uploadMulter.single("file"), createNewReport);

export { router as reportRouter };