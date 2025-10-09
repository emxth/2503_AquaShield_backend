import { Router } from "express";
import { uploadMulter } from "../middleware/uploadMulter.js";
import { createNewReport, deleteReport, getAllReports, getAllReportsResearcher, getIncidentTypes, getSubmittedReports, reportFilterBySatatus, updateReports, getAllReportsDashboard } from "../controller/reportController.js";

const router = Router();

router.post("/create", uploadMulter.single("file"), createNewReport);
router.get("/getReports", getSubmittedReports);
router.get("/getAllReports", getAllReports);

router.get("/getAllReportsResearcher", getAllReportsResearcher);
router.get("/getAllReportsDashboard", getAllReportsDashboard);
router.get("/filteredReport", reportFilterBySatatus);
router.get("/incidentType", getIncidentTypes);
router.put("/updateReport", updateReports);
router.delete("/deleteReport", deleteReport);


export { router as reportRouter };