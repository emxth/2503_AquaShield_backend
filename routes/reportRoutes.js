import { Router } from "express";
import { uploadMulter } from "../middleware/uploadMulter.js";
<<<<<<< Updated upstream
import { createNewReport, deleteReport, getAllReports, getIncidentTypes, getSubmittedReports, reportFilterBySatatus, updateReports } from "../controller/reportController.js";

const router = Router();

router.post("/create", uploadMulter.single("file"), createNewReport);
router.get("/getReports", getSubmittedReports);
router.get("/getAllReports", getAllReports);
router.get("/filteredReport", reportFilterBySatatus);
router.get("/incidentType", getIncidentTypes);
router.put("/updateReport", updateReports);
router.delete("/deleteReport", deleteReport);


export { router as reportRouter };