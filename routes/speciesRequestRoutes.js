import express from "express";
import { addSpeciesRequest, getSpeciesRequest, getSpeciesRequestById , updateSpeciesRequestMessage ,updateSpeciesRequestStatus, updateSpeciesRequest} from "../controllers/speciesRequestController.js";
import upload from "../middlewares/upload.js";


const router = express.Router();

// Routes
router.post("/addSpeciesRequest", upload.single("image"), addSpeciesRequest);
router.get("/getOneSpeciesRequests/:id", getSpeciesRequestById);
router.get("/getAllSpeciesRequests", getSpeciesRequest);
router.put("/updateSpeciesRequest/:id", upload.single("image"), updateSpeciesRequest);
router.put("/updateStatus/:id", updateSpeciesRequestStatus);
router.put("/updateSpeciesRequestMessage/:id", updateSpeciesRequestMessage);

export default router;
