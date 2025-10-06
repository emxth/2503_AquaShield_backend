import { Router } from "express";
import { uploadMulter } from "../middleware/uploadMulter.js";
import _default from "validator";
import { 
  createNewReport, 
  deleteReport, 
  getAllReports, 
  getIncidentTypes, 
  getSubmittedReports, 
  reportFilterBySatatus, 
  updateReports,
  getRecentReports,
  getTrendData,
  getSpeciesData,
  getMonthlyStats,
  getMonthlyFrequency,
  getStatusData,
  getKeyMetrics
} from "../controller/reportController.js";

const reportRouter = Router();

reportRouter.post("/create", uploadMulter.array("files"), createNewReport);
reportRouter.get("/getReports", getSubmittedReports);
reportRouter.get("/getAllReports", getAllReports);
reportRouter.get("/filteredReport", reportFilterBySatatus);
reportRouter.get("/incidentType", getIncidentTypes);
reportRouter.put("/updateReport", updateReports);
reportRouter.delete("/deleteReport", deleteReport);

// Routes for Admin Dashboard & Analytics
reportRouter.get("/recent", getRecentReports);
reportRouter.get("/trends", getTrendData);
reportRouter.get("/species", getSpeciesData);
reportRouter.get("/monthly-stats", getMonthlyStats);
reportRouter.get("/frequency", getMonthlyFrequency);
reportRouter.get("/status", getStatusData);
reportRouter.get("/key-metrics", getKeyMetrics);

export default reportRouter;