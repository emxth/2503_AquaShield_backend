import multer from "multer";
import asyncHandler from "express-async-handler";
import { create } from "../models/ReportModel";
import mongoose from "mongoose";
import { json } from "express";


//create a new report
const createNewReport = asyncHandler(async (req, res) => {
    try {

        console.log("==Report New Incident==");

        const { location, Date, Time, incidentType, species, description } = req.body;

        const evidence = req.files.map(file => ({
            url: file.path,
            public_id: file.filename,
            resource_type: file.resource_type,
        }))

        const newIncident = await create({
            reporter: req.user._id,
            location: JSON.parse(location),
            Date,
            Time,
            incidentType,
            species,
            description,
            evidence,
            status: "PENDING",

        });

        console.log("Report Submitted Successfully", newIncident);

        res.status(201).json({
            message: "Incident Recorded SuccessFully",
            newIncident,

        });


    } catch (error) {
        console.error("Error occured in creating Report", error);
        res.status(500), json({
            message: "Error occured in creating Report",
            error: error.message,
        });
    }
})
module.export = {
    createNewReport
};
