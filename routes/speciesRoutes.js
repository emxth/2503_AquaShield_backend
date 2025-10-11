import express from "express";
import { addSpecies, getSpeciesSuggestions , getSpecies, getWikipediaInfo, getSpeciesById, deleteSpecies, updateSpecies, getSpeciesDashboard, getSpeciesHistory, searchSpecies, getEndangeredReport, getExtinctReport, getVulnerableReport} from "../controllers/speciesController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Routes
router.post("/add", upload.single("image"), addSpecies);
router.get("/getAllSpecies", getSpecies);

router.get("/specieshistory", getSpeciesHistory);
router.get("/dashboard", getSpeciesDashboard);
router.get("/getOneSpecies/:id", getSpeciesById);
router.delete("/deleteSpecies/:id", deleteSpecies);
router.put("/updateSpecies/:id", upload.single("image"), updateSpecies);

router.get("/speciesSuggestions", getSpeciesSuggestions);
router.get("/searchSpecies", searchSpecies);

//--
router.get("/report/endangered", getEndangeredReport);
router.get("/report/extinct", getExtinctReport);
router.get("/report/vulnerable", getVulnerableReport);

router.get("/wiki/:scientificName", getWikipediaInfo);

export default router;
