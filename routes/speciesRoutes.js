import express from "express";
import upload from "../middlewares/upload.js";
import { 
  addSpecies, 
  getSpecies, 
  getSpeciesById, 
  deleteSpecies, 
  updateSpecies, 
  getSpeciesStats 
} from "../controllers/speciesController.js";

const router = express.Router();

// Routes
router.post("/add", upload.single("image"), addSpecies);
router.get("/getAllSpecies", getSpecies);

router.get("/getOneSpecies/:id", getSpeciesById);
router.delete("/deleteSpecies/:id", deleteSpecies);
router.put("/updateSpecies/:id", upload.single("image"), updateSpecies);

// Routes for Admin Dashboard
router.get("/stats", getSpeciesStats);

export default router;
