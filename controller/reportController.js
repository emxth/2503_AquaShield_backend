import multer from "multer";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { json } from "express";
import ReportModel from "../models/ReportModel.js";


//create a new report
const createNewReport = asyncHandler(async (req, res) => {
    try {

        console.log("==Report New Incident==");

        const parsedLocation = JSON.parse(req.body.locationInfo);
        const parsedIncident = JSON.parse(req.body.incidentInfo);
        const parsedPersonal = JSON.parse(req.body.personalInfo);

        console.log("Longitude:", parsedLocation.lng, "Type:", typeof parsedLocation.lng);
        console.log("Latitude:", parsedLocation.lat, "Type:", typeof parsedLocation.lat);

        console.log("📍 Location Data Received:", {
            lng: parsedLocation.lng,
            lat: parsedLocation.lat,
            hasLng: !!parsedLocation.lng,
            hasLat: !!parsedLocation.lat,
            lngType: typeof parsedLocation.lng,
            latType: typeof parsedLocation.lat
        });

        // CRITICAL FIX: Validate coordinates before using them
        let coordinates = null;

        if (parsedLocation.lng !== null && parsedLocation.lat !== null &&
            parsedLocation.lng !== undefined && parsedLocation.lat !== undefined) {

            const lng = parseFloat(parsedLocation.lng);
            const lat = parseFloat(parsedLocation.lat);

            if (!isNaN(lng) && !isNaN(lat)) {
                coordinates = [lng, lat];
            }
        }

        // If coordinates are invalid, don't create geo point
        let locationData = {
            description: parsedLocation.description || "Location not specified"
        };

        if (coordinates) {
            locationData.type = "Point";
            locationData.coordinates = coordinates;
        } else {
            // Create without geo data to avoid the error
            console.warn("⚠️ Invalid coordinates - creating report without geo data");
            locationData.type = "Point";
            locationData.coordinates = undefined; // Don't include invalid coordinates
        }

        const evidence = req.files.map(file => ({
            url: file.path,
            public_id: file.filename,
            resource_type: file.resource_type,
        }))

        const newIncident = await ReportModel.create({
            reporter: "68ce9ce7fcece28d887e4cf4",
            isAnonymous: parsedPersonal.annonymity,
            location: {
                type: "Point",
                coordinates: [parsedLocation.lng, parsedLocation.lat],
                description: parsedLocation.description
            },
            date: parsedIncident.incidentDate,
            time: parsedIncident.incidentTime,
            incidentType: parsedIncident.incidentType,
            species: parsedIncident.species,
            description: parsedIncident.description,
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

const getSpecificReports = asyncHandler(async (req, res) => {
    const reportId = req.params;

    const reports = await ReportModel.findById({ _id: reportId });
    res.status(200).json(reports);
})

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

export {
    createNewReport,
    getSubmittedReports,
    getAllReports,
    reportFilterBySatatus,
    getIncidentTypes,
    updateReports,
    deleteReport,
    getSpecificReports
};