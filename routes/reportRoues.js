const express = require("express");
const { uploadMulter } = require("../middleware/uploadMulter");
const { createNewReport } = require("../controller/reportController");

const router = express.Router();

router.post("/create", uploadMulter.single("file"), createNewReport);

module.export = { reportRouter: router };