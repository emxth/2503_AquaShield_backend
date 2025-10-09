import multer from "multer";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { json } from "express";
import ReportModel from "../models/ReportModel.js";
import SpeciesModel from '../models/speciesModel.js';

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

        let parseLocation;
        try {
            parseLocation = typeof location === 'string' ? JSON.parse(location) : location;
        } catch (parseError) {
            return res.status(400).json({
                message: "Invalid location format",
                error: parseError.message
            });
        } 

        const newIncident = await ReportModel.create({
            reporter: req.user._id,
            annonymity,
            location: {
                type: "Point",
                coordinates: parseLocation.coordinates,
                description: parseLocation.description
            },
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

const getIncidentTypes = asyncHandler(async (req, res) => {
    try {
        const incidentTypes = ReportModel.schema.path('incidentType').enumValues;
        res.json(incidentTypes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch incident types' });
    }
});

const getAllReportsDashboard = asyncHandler(async (req, res) => {
  try {
    const reports = await ReportModel.find();

    const filterReports = reports.map((report) => {
        if (report.isAnonymous) {
            report.reporter = "Annoymous";
        }
        return report;
    })

    res.status(200).json(filterReports);  // send only once
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const updateReports = asyncHandler(async (req, res) => {
    try {

        const { location, Date, Time, incidentType, species, description, annonymity } = req.body;
        const { id } = req.params;

        const report = await ReportModel.findById(id);

        updateData = {};

        if (location) {
            if (location.description) {
                updateData["location.description"] = location.description;

            }
            if (location.coordinates) {
                updateData["location.coordinates"] = location.coordinates;

            }

        }
        if (incidentType) {
            updateData.incidentType = incidentType;
        }
        if (species) {
            updateData.species = species;
        }
        if (description) {
            updateData.description = description;
        }

        const updateReport = await ReportModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });

        res.status(200).json({ message: "Update Successfully", updateReport });
    } catch (err) {
        console.error(err);
        res.status(500).json({ Error: err })
    }
})


const deleteReport = asyncHandler(async (req, res) => {

    try {
        const { id } = req.params;

        const deleteReport = await ReportModel.findByIdAndDelete(id);

        if (!deleteReport) {
            return res.status(404).json({ success: false, message: "Report not found" })
        }

        res.status(200).json({ success: true, message: "Report deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
})

const getAllReportsResearcher = asyncHandler(async (req, res) => {
  try {
    // Fetch all reports and populate species details
    const reports = await ReportModel.find()
      .populate('species', 'commonName protectionLevel');

    // Optional: Hide reporter info if anonymous
    const filteredReports = reports.map((report) => {
      if (report.isAnonymous) {
        report.reporter = "Anonymous";
      }
      return report;
    });

    res.status(200).json(filteredReports);
  } catch (err) {
    console.error("Error fetching reports for researcher:", err);
    res.status(500).json({ error: err.message });
  }
});

export {
    createNewReport,
    getSubmittedReports,
    getAllReports,
    reportFilterBySatatus,
    getIncidentTypes,
    updateReports,
    deleteReport,
    getAllReportsDashboard,
    getAllReportsResearcher
};