import { Router } from "express";
import { uploadMulter } from "../middleware/uploadMulter.js";
import { 
  createNewReport, 
  deleteSubmitReport, 
  getAllReports, 
  getIncidentTypes, 
  getSpecificReports, 
  getSubmittedReports, 
  reportFilterBySatatus, 
  updateReports, 
  updateReportStatus,
  deleteReport, 
  getAllReportsResearcher, 
  exportFilteredReports, 
  getAllReportsDashboard 
} from "../controller/reportController.js";

const reportRouter = Router();

reportRouter.post("/create", uploadMulter.array("evidence"), createNewReport);
reportRouter.get("/getReports", getSubmittedReports);
reportRouter.get("/getAllReports", getAllReports);
reportRouter.get("/filteredReport", reportFilterBySatatus);
reportRouter.get("/incidentType", getIncidentTypes);
reportRouter.put("/updateReport/:id", uploadMulter.array("evidence"), updateReports);
reportRouter.delete("/deleteReport/:id", deleteSubmitReport);
reportRouter.get("/getSpecificReport/:id", getSpecificReports);
reportRouter.put("/reportAction/:id", updateReportStatus);

// Routes for Species Management
reportRouter.post("/create", uploadMulter.single("file"), createNewReport);
reportRouter.post("/exportFilteredReports", exportFilteredReports);
reportRouter.put("/updateReport", updateReports);
reportRouter.delete("/deleteReport", deleteReport);

export default reportRouter;