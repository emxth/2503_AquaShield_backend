import { Router } from "express";
import { uploadMulter } from "../middleware/uploadMulter.js";
import _default from "validator";
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
  // deleteReport, 
  getAllReportsResearcher, 
  exportFilteredReports, 
  getAllReportsDashboard, 
  getRecentReports,
  getTrendData,
  getSpeciesData,
  getMonthlyStats,
  getMonthlyFrequency,
  getStatusData,
  getKeyMetrics,
  getHotspots,
  getReports,
  updateReportStatusAdmin
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
// reportRouter.delete("/deleteReport", deleteReport);

// Routes for Admin Dashboard & Analytics
reportRouter.get("/recent", getRecentReports);
reportRouter.get("/trends", getTrendData);
reportRouter.get("/species", getSpeciesData);
reportRouter.get("/monthly-stats", getMonthlyStats);
reportRouter.get("/frequency", getMonthlyFrequency);
reportRouter.get("/status", getStatusData);
reportRouter.get("/key-metrics", getKeyMetrics);
reportRouter.get("/hotspots", getHotspots);
reportRouter.get("/all-reports", getReports);
reportRouter.put("/updateStatus/:id", updateReportStatusAdmin);

export default reportRouter;