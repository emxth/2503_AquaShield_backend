import multer from "multer";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { json } from "express";
import ReportModel from "../models/ReportModel.js";

// const Report = require("../models/ReportModel.js");

//create a new report
const createNewReport = asyncHandler(async (req, res) => {
    try {

        console.log("==Report New Incident==");

        const parsedLocation = JSON.parse(req.body.locationInfo);
        const parsedIncident = JSON.parse(req.body.incidentInfo);
        const parsedPersonal = JSON.parse(req.body.personalInfo);

        const evidence = req.files.map(file => ({
            url: file.path,
            public_id: file.filename,
            resource_type: file.resource_type,
        }))

        {/*let parseLocation;
        try {
            parseLocation = typeof location === 'string' ? JSON.parse(location) : location;
        } catch (parseError) {
            return res.status(400).json({
                message: "Invalid location format",
                error: parseError.message
            });
        }*/}

        const newIncident = await ReportModel.create({
            reporter: "68ce9ce7fcece28d887e4cf4",
            isAnonymous: parsedPersonal.annonymity,
            location: {
                type: "Point",
                coordinates: [parsedLocation.lng, parsedLocation.lat],
                description: parseLocation.description
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
});

//report filter by status
const reportFilterBySatatus = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const reports = await ReportModel.find(status);

    res.status(200).json(reports);


});

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

});

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
});

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
});

// Get recent 5 reports
const getRecentReports = asyncHandler(async (req, res) => {
  try {
    const reports = await ReportModel.find()
      .populate("species", "CommonName ScientificName ProtectionStatus SpeciesCategory") // populate species name
      .select('location description incidentType status date time evidencePhotos')
      .sort({ date: -1 }) // latest first
      .limit(5);

    const formatted = reports.map((r, i) => ({
      id: r._id,
      species: r.species?.CommonName || "Tuna",
      location: r.location || "Unknown Location",
      date: r.date.toISOString().split("T")[0],
      status: r.status.toLowerCase(),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Get monthly trend data
const getTrendData = asyncHandler(async (req, res) => {
  try {
    const result = await ReportModel.aggregate([
      {
        $group: {
          _id: { $month: "$date" },
          incidents: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const formatted = result.map(r => ({
      month: months[r._id - 1],
      incidents: r.incidents,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trend data" });
  }
});

// Get most reported species
const getSpeciesData = asyncHandler(async (req, res) => {
  try {
    const result = await ReportModel.aggregate([
      { $group: { _id: "$species", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "species",
          localField: "_id",
          foreignField: "_id",
          as: "speciesDetails",
        },
      },
      { $unwind: "$speciesDetails" },
      { $project: { species: "$speciesDetails.CommonName", count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch species data" });
  }
});

// Get monthly statistics
const getMonthlyStats = asyncHandler(async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const stats = await ReportModel.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "CONFIRMED"] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] }
          },
        },
      },
      {
        $project: {
          totalReports: 1,
          pending: 1,
          approved: 1,
          rejected: 1,
          cancelled: 1,
          successRate: {
            $multiply: [
              { $divide: ["$approved", "$totalReports"] },
              100
            ]
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalReports: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
      successRate: 0
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching monthly stats:", error);
    res.status(500).json({ error: "Failed to fetch monthly stats" });
  }
});

// Get monthly frequency data (incidents vs prevented)
const getMonthlyFrequency = asyncHandler(async (req, res) => {
  try {
    const data = await ReportModel.aggregate([
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          incidents: { $sum: 1 },
          prevented: { $sum: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] } },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Map month numbers → names
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const formatted = data.map((item) => ({
      month: months[item._id.month - 1],
      incidents: item.incidents,
      prevented: item.prevented,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Frequency stats error:", error);
    res.status(500).json({ message: "Error fetching frequency data" });
  }
});

// Get status distribution data
const getStatusData = asyncHandler(async (req, res) => {
  try {
    const data = await ReportModel.aggregate([
      {
        $group: {
          _id: "$status",
          value: { $sum: 1 }
        }
      }
    ]);

    const formatted = data.map((item) => ({
      name: item._id,
      value: item.value,
      color:
        item._id === "Approved"
          ? "hsl(var(--primary))"
          : item._id === "Pending"
          ? "hsl(var(--muted))"
          : "hsl(var(--destructive))",
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Status stats error:", error);
    res.status(500).json({ message: "Error fetching status data" });
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
    getSpecificReports,
    getRecentReports,
    getTrendData,
    getSpeciesData,
    getMonthlyStats,
    getMonthlyFrequency,
    getStatusData
}