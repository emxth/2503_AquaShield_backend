import express from "express";
import { addSpecies, getSpecies, getSpeciesById } from "../controllers/speciesController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Routes
router.post("/add", upload.single("image"), addSpecies);
router.get("/getAllSpecies", getSpecies);

router.get("/getOneSpecies/:id", getSpeciesById);

export default router;
