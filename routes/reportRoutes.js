import { Router } from "express";
import { uploadMulter } from "../middleware/uploadMulter.js";
import { createNewReport, getAllReports, getSubmittedReports, reportFilterBySatatus } from "../controller/reportController.js";

const router = Router();

router.post("/create", uploadMulter.single("file"), createNewReport);
router.get("/getReports", getSubmittedReports);
router.get("/getAllReports", getAllReports);
router.get("/filteredReport", reportFilterBySatatus)

export { router as reportRouter };