import { Router } from "express";
import { uploadMulter } from "../middleware/uploadMulter.js";
import { createNewReport, deleteReport, getAllReports, getIncidentTypes, getSubmittedReports, reportFilterBySatatus, updateReports } from "../controller/reportController.js";


const router = Router();

reportRouter.post("/createReports", uploadMulter.single("file"), createNewReport);
reportRouter.get("/getReports", getSubmittedReports);
reportRouter.get("/getAllReports", getAllReports);
reportRouter.get("/filteredReport", reportFilterBySatatus);
reportRouter.get("/incidentType", getIncidentTypes);
reportRouter.put("/updateReport", updateReports);
reportRouter.delete("/deleteReport", deleteReport);
reportRouter.get("/getSpecificReport/:id", getSpecificReports);


export { router as reportRouter };