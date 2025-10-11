import express from "express";
import { addSpeciesRequest, getSpeciesRequest, getSpeciesRequestById , updateSpeciesRequestMessage ,updateSpeciesRequestStatus, updateSpeciesRequest, deleteSpeciesRequest} from "../controllers/speciesRequestController.js";
import upload from "../middlewares/upload.js";


const router = express.Router();

// Routes
router.post("/addSpeciesRequest", upload.single("image"), addSpeciesRequest);
router.get("/getOneSpeciesRequests/:speciesId", getSpeciesRequestById);
router.get("/getAllSpeciesRequests", getSpeciesRequest);
router.delete("/deleteSpeciesRequest/:speciesId", deleteSpeciesRequest);
router.put("/updateSpeciesRequest/:speciesId", upload.single("image"), updateSpeciesRequest);
router.put("/updateStatus/:id", upload.single("image"), updateSpeciesRequestStatus);
router.put("/updateSpeciesRequestMessage/:id", updateSpeciesRequestMessage);

export default router;
