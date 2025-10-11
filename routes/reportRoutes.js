import { Router } from "express";
import { uploadMulter } from "../middleware/uploadMulter.js";
import { createNewReport, deleteSubmitReport, getAllReports, getIncidentTypes, getSpecificReports, getSubmittedReports, reportFilterBySatatus, updateReports, updateReportStatus } from "../controller/reportController.js";


const reportRouter = Router();

reportRouter.post("/create", uploadMulter.array("evidence"), createNewReport);
reportRouter.get("/getReports", getSubmittedReports);
reportRouter.get("/getAllReports", getAllReports);
reportRouter.get("/filteredReport", reportFilterBySatatus);
reportRouter.get("/incidentType", getIncidentTypes);
reportRouter.put("/updateReport", updateReports);
reportRouter.delete("/deleteReport/:id", deleteSubmitReport);
reportRouter.get("/getSpecificReport/:id", getSpecificReports);
reportRouter.put("/reportAction/:id", updateReportStatus);

export default reportRouter;