import { Router } from "express";
import { uploadMulter } from "../middleware/uploadMulter.js";
import { createNewReport, deleteReport, getAllReports, getIncidentTypes, getSubmittedReports, reportFilterBySatatus, updateReports } from "../controller/reportController.js";
import _default from "validator";

const reportRouter = Router();

reportRouter.post("/create", uploadMulter.single("file"), createNewReport);
reportRouter.get("/getReports", getSubmittedReports);
reportRouter.get("/getAllReports", getAllReports);
reportRouter.get("/filteredReport", reportFilterBySatatus);
reportRouter.get("/incidentType", getIncidentTypes);
reportRouter.put("/updateReport", updateReports);
reportRouter.delete("/deleteReport", deleteReport);


export default reportRouter;