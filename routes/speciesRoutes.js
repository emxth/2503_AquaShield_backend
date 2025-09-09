import express from "express";
import { addSpecies, getSpecies } from "../controllers/speciesController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Routes
router.post("/add", upload.single("image"), addSpecies);
router.get("/all", getSpecies);

export default router;
