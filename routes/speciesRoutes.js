import express from "express";
import { addSpecies, getSpecies, getSpeciesById, deleteSpecies, updateSpecies } from "../controllers/speciesController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Routes
router.post("/add", upload.single("image"), addSpecies);
router.get("/getAllSpecies", getSpecies);

router.get("/getOneSpecies/:id", getSpeciesById);
router.delete("/deleteSpecies/:id", deleteSpecies);
router.put("/updateSpecies/:id", upload.single("image"), updateSpecies);


export default router;
