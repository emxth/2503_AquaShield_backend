import multer from "multer";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { json } from "express";
import ReportModel from "../models/ReportModel.js";


//create a new report
const createNewReport = asyncHandler(async (req, res) => {
    try {

        console.log("==Report New Incident==");

        const { location, Date, Time, incidentType, species, description, annonymity } = req.body;

        const evidence = req.files.map(file => ({
            url: file.path,
            public_id: file.filename,
            resource_type: file.resource_type,
        }))

        const newIncident = await ReportModel.create({
            reporter: req.user._id,
            annonymity,
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
});

const getSubmittedReports = asyncHandler(async (req, res) => {

    const userID = req.user._id;
    const reports = await ReportModel.find({ reporter: userID });

    res.status(200).json(reports);
});

//report filter by status
const reportFilterBySatatus = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const reports = await ReportModel.find(status);

    res.status(200).json(reports);


})

const getAllReports = asyncHandler(async (req, res) => {

    try {

        const reports = await ReportModel.find();
        res.status(200).json(reports);

        const filterReports = reports.map((report) => {
            if (report.isAnonymous) {
                report.reporter = "Annoymous";
            }
            return report;
        })

        res.status(200).json(filterReports);

    } catch (err) {
        console.log("Error occured");
        res.status(500).json({ error: err.message });
    }

})



export {
    createNewReport,
    getSubmittedReports,
    getAllReports,
    reportFilterBySatatus,
};