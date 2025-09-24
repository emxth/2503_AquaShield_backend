import { Router } from "express";
import { uploadMulter } from "../middleware/uploadMulter.js";
import { createNewReport, deleteReport, getAllReports, getIncidentTypes, getSpecificReports, getSubmittedReports, reportFilterBySatatus, updateReports } from "../controller/reportController.js";


const reportRouter = Router();

reportRouter.post("/create", uploadMulter.array("files"), createNewReport);
reportRouter.get("/getReports", getSubmittedReports);
reportRouter.get("/getAllReports", getAllReports);
reportRouter.get("/filteredReport", reportFilterBySatatus);
reportRouter.get("/incidentType", getIncidentTypes);
reportRouter.put("/updateReport", updateReports);
reportRouter.delete("/deleteReport", deleteReport);
reportRouter.get("/getSpecificReport/:id", getSpecificReports);


export default reportRouter;