import { Router } from "express";
import { uploadMulter } from "../middleware/uploadMulter.js";
<<<<<<< Updated upstream
import { createNewReport, deleteReport, getAllReports, getIncidentTypes, getSubmittedReports, reportFilterBySatatus, updateReports } from "../controller/reportController.js";
import _default from "validator";
=======
import { createNewReport, deleteReport, getAllReports, getIncidentTypes, getSpecificReports, getSubmittedReports, reportFilterBySatatus, updateReports } from "../controller/reportController.js";
>>>>>>> Stashed changes

const reportRouter = Router();

<<<<<<< Updated upstream
reportRouter.post("/create", uploadMulter.array("files"), createNewReport);
reportRouter.get("/getReports", getSubmittedReports);
reportRouter.get("/getAllReports", getAllReports);
reportRouter.get("/filteredReport", reportFilterBySatatus);
reportRouter.get("/incidentType", getIncidentTypes);
reportRouter.put("/updateReport", updateReports);
reportRouter.delete("/deleteReport", deleteReport);

=======
router.post("/createReports", uploadMulter.single("file"), createNewReport);
router.get("/getReports", getSubmittedReports);
router.get("/getAllReports", getAllReports);
router.get("/filteredReport", reportFilterBySatatus);
router.get("/incidentType", getIncidentTypes);
router.put("/updateReport", updateReports);
router.delete("/deleteReport", deleteReport);
router.get("/getSpecificReport/:id", getSpecificReports);
>>>>>>> Stashed changes

export default reportRouter;