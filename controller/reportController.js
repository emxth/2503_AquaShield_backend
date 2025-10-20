import multer from "multer";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { json } from "express";
import ReportModel from "../models/ReportModel.js";
import SpeciesModel from '../models/speciesModel.js';
import PDFDocument from 'pdfkit';

//create a new report
const createNewReport = asyncHandler(async (req, res) => {
  try {

    console.log("==Report New Incident==");

    const parsedLocation = JSON.parse(req.body.locationInfo);
    const parsedIncident = JSON.parse(req.body.incidentInfo);
    const parsedPersonal = JSON.parse(req.body.personalInfo);

    const currentDate = new Date();

    const incidentDate = parsedIncident.incidentDate && parsedIncident.incidentDate.trim() !== '' ?
      parsedIncident.incidentDate : currentDate.toISOString().split('T')[0];

    const incidentTime = parsedIncident.incidentTime && parsedIncident.incidentTime.trim() !== ''
      ? parsedIncident.incidentTime : currentDate.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

    const evidence = req.files ? req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
      resource_type: file.resource_type || (file.mimetype.startsWith('image/') ? 'image' : 'video'),
    })) : [];

    console.log("Processed evidence:", evidence);

    const newIncident = await ReportModel.create({
      reporter: "68ce9ce7fcece28d887e4cf4",
      isAnonymous: parsedPersonal.anonymity,
      location: {
        type: "Point",
        coordinates: [parsedLocation.lng, parsedLocation.lat],
        description: parsedLocation.description
      },
      date: incidentDate,
      time: incidentTime,
      incidentType: parsedIncident.incidentType,
      species: parsedIncident.species,
      description: parsedIncident.description,
      evidencePhotos: evidence,

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

const getSubmittedReports = asyncHandler(async (req, res) => {

  const userID = "68ce9ce7fcece28d887e4cf4";
  const reports = await ReportModel.find({ reporter: userID });

  res.status(200).json({
    success: true,
    data: reports, // Wrap in consistent structure
    count: reports.length
  });
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

    res.status(200).json({
      success: true,
      data: filterReports
    });

  } catch (err) {
    console.log("Error occured");
    res.status(500).json({
      success: false,
      data: 'Failed to fetch all report types'
    });

  }

});

const getIncidentTypes = asyncHandler(async (req, res) => {
  try {
    const incidentTypes = ReportModel.schema.path('incidentType').enumValues;
    res.status(200).json({
      success: true,
      data: incidentTypes
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch incident types'
    });
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

const updateReportStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const report = await ReportModel.findById(id);
  const updateData = {
    status: status,
  };

  const updateStatus = await ReportModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
  res.status(200).json({
    success: true,
    message: 'Report status updated successfully',
    data: updateStatus
  });


})

const updateReports = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const parsedLocation = JSON.parse(req.body.locationInfo);
    const parsedIncident = JSON.parse(req.body.incidentInfo);
    const parsedPersonal = JSON.parse(req.body.personalInfo);

    console.log("Parsed location:", parsedLocation);
    console.log("Parsed incident:", parsedIncident);
    console.log("Parsed personal:", parsedPersonal);

    // Check if report exists first
    const existingReport = await ReportModel.findById(id);
    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    // Handle coordinates safely
    let coordinates;
    if (parsedLocation.lat !== undefined && parsedLocation.lng !== undefined) {
      const lat = parseFloat(parsedLocation.lat);
      const lng = parseFloat(parsedLocation.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        coordinates = [lng, lat];
      }
    }

    // Prepare location update - use existing data as fallback
    let locationUpdate = {
      description: parsedLocation.description || existingReport.location?.description || "Location not specified",
    };

    if (coordinates) {
      locationUpdate.type = "Point";
      locationUpdate.coordinates = coordinates;
    } else if (existingReport.location?.coordinates) {
      locationUpdate.type = "Point";
      locationUpdate.coordinates = existingReport.location.coordinates;
    }

    // Prepare incident update with fallbacks
    const incidentUpdate = {
      incidentType: parsedIncident.incidentType || existingReport.incidentType,
      species: parsedIncident.species || existingReport.species,
      description: parsedIncident.description || existingReport.description,
    };

    // Prepare evidence update
    const newEvidence = req.files && req.files.length > 0
      ? req.files.map(file => ({
        url: file.path,
        public_id: file.filename,
        resource_type: file.resource_type || (file.mimetype?.startsWith('image/') ? 'image' : 'video'),
      }))
      : [];

    // Merge existing evidence with new evidence
    const updatedEvidence = [
      ...(existingReport.evidencePhotos || []),
      ...newEvidence
    ];

    // Prepare final update object
    const updateData = {
      location: {
        type: locationUpdate.type,
        coordinates: locationUpdate.coordinates,
        description: locationUpdate.description
      },
      incidentType: incidentUpdate.incidentType,
      species: incidentUpdate.species,
      description: incidentUpdate.description,
      evidencePhotos: updatedEvidence,
      isAnonymous: parsedPersonal.anonymity !== undefined ? parsedPersonal.anonymity : existingReport.isAnonymous,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    console.log("Update data:", updateData);

    const updatedReport = await ReportModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data: updatedReport
    });

  } catch (err) {
    console.error("Update report error:", err);
    res.status(500).json({
      success: false,
      message: "Error updating report",
      error: err.message
    });
  }
});

const deleteSubmitReport = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID format"
      });
    }

    const report = await ReportModel.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    await ReportModel.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Report deleted successfully"
    });
  } catch (error) {
    console.error("Delete report error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
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

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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

// Get monthly statistics with filters
const getMonthlyStats = asyncHandler(async (req, res) => {
  try {
    const { species, region, from, to } = req.query;

    // Build match stage for filters
    const matchStage = {};

    // Date filter
    if (from && to) {
      matchStage.date = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    } else {
      // Default to current month if no date range
      const now = new Date();
      matchStage.date = {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      };
    }

    // Species filter
    if (species && species !== 'all') {
      // First get species ID from name
      const speciesDoc = await SpeciesModel.findOne({
        CommonName: new RegExp(species, 'i')
      });
      if (speciesDoc) {
        matchStage.species = speciesDoc._id;
      }
    }

    // Region filter (using location description)
    if (region && region !== 'all') {
      matchStage['location.description'] = new RegExp(region, 'i');
    }

    const stats = await ReportModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ["$status", "CONFIRMED"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
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
            $round: [
              { $multiply: [{ $divide: ["$approved", "$totalReports"] }, 100] },
              2
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

// Get frequency data with filters
const getMonthlyFrequency = asyncHandler(async (req, res) => {
  try {
    const { species, region, from, to } = req.query;

    const matchStage = {};

    if (from && to) {
      matchStage.date = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    if (species && species !== 'all') {
      const speciesDoc = await SpeciesModel.findOne({
        CommonName: new RegExp(species, 'i')
      });
      if (speciesDoc) {
        matchStage.species = speciesDoc._id;
      }
    }

    if (region && region !== 'all') {
      matchStage['location.description'] = new RegExp(region, 'i');
    }

    const data = await ReportModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" }
          },
          incidents: { $sum: 1 },
          prevented: { $sum: { $cond: [{ $eq: ["$status", "CONFIRMED"] }, 1, 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const formatted = data.map((item) => ({
      month: `${months[item._id.month - 1]} ${item._id.year}`,
      incidents: item.incidents,
      prevented: item.prevented,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Frequency stats error:", error);
    res.status(500).json({ message: "Error fetching frequency data" });
  }
});

// Get status data with filters
const getStatusData = asyncHandler(async (req, res) => {
  try {
    const { species, region, from, to } = req.query;

    const matchStage = {};

    if (from && to) {
      matchStage.date = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    if (species && species !== 'all') {
      const speciesDoc = await SpeciesModel.findOne({
        CommonName: new RegExp(species, 'i')
      });
      if (speciesDoc) {
        matchStage.species = speciesDoc._id;
      }
    }

    if (region && region !== 'all') {
      matchStage['location.description'] = new RegExp(region, 'i');
    }

    const data = await ReportModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          value: { $sum: 1 }
        }
      }
    ]);

    const statusColors = {
      "PENDING": "hsl(var(--muted))",
      "CONFIRMED": "hsl(var(--primary))",
      "REJECTED": "hsl(var(--destructive))",
      "CANCELLED": "hsl(var(--muted-foreground))"
    };

    const formatted = data.map((item) => ({
      name: item._id,
      value: item.value,
      color: statusColors[item._id] || "hsl(var(--muted-foreground))"
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Status stats error:", error);
    res.status(500).json({ message: "Error fetching status data" });
  }
});

// Get key metrics for statistics
const getKeyMetrics = asyncHandler(async (req, res) => {
  try {
    // Total incidents (this year)
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const totalIncidents = await ReportModel.countDocuments({
      date: {
        $gte: startOfYear
      }
    });

    // Prevented incidents (status = Approved)
    const prevented = await ReportModel.countDocuments({ status: "CONFIRMED" });

    // Active hotspots (example: group by location where count > 5)
    const hotspots = await ReportModel.aggregate([
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $match: { count: { $gte: 5 } } }
    ]);

    const preventionRate = totalIncidents > 0
      ? ((prevented / totalIncidents) * 100).toFixed(1)
      : 0;

    res.json({
      totalIncidents,
      prevented,
      preventionRate,
      activeHotspots: hotspots.length,
    });
  } catch (error) {
    console.error("Key metrics error:", error);
    res.status(500).json({ message: "Error fetching key metrics" });
  }
});

// Get top 5 hotspots by incident count
const getHotspots = asyncHandler(async (req, res) => {
  try {
    const hotspots = await ReportModel.aggregate([
      {
        $group: {
          _id: "$location.description", // group by region/description
          incidents: { $sum: 1 },
          lat: { $first: { $arrayElemAt: ["$location.coordinates", 1] } }, // latitude
          lng: { $first: { $arrayElemAt: ["$location.coordinates", 0] } }, // longitude
        },
      },
      { $sort: { incidents: -1 } }, // sort by highest incidents
      { $limit: 5 }, // top 5
    ]);

    const formatted = hotspots.map((h) => ({
      region: h._id,
      incidents: h.incidents,
      lat: h.lat,
      lng: h.lng,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching hotspots:", error);
    res.status(500).json({ message: "Error fetching hotspots" });
  }
});

// Get all reports to display in admin dashboard
const getReports = asyncHandler(async (req, res) => {
  try {
    const reports = await ReportModel.aggregate([
      {
        $lookup: {
          from: "species",
          localField: "species",
          foreignField: "_id",
          as: "speciesData",
        },
      },
      { $unwind: { path: "$speciesData", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "users",
          localField: "reporter",
          foreignField: "_id",
          as: "reporterData",
        },
      },
      { $unwind: { path: "$reporterData", preserveNullAndEmptyArrays: true } },

      { $sort: { date: -1 } },

      {
        $project: {
          id: "$_id",
          species: { $ifNull: ["$speciesData.CommonName", "Unknown Species"] },
          location: "$location.description",
          coordinates: "$location.coordinates",
          // Safely handle invalid or string dates
          date: {
            $cond: {
              if: { $eq: [{ $type: "$date" }, "date"] },
              then: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              else: "Unknown",
            },
          },
          time: {
            $cond: {
              if: { $eq: [{ $type: "$time" }, "date"] },
              then: { $dateToString: { format: "%H:%M:%S", date: "$time" } },
              else: "Unknown",
            },
          },
          incidentType: 1,
          status: { $toLower: "$status" },
          reporter: {
            $cond: {
              if: "$isAnonymous",
              then: "Anonymous",
              else: { $ifNull: ["$reporterData.name", "Unknown Reporter"] },
            },
          },
          evidencePhotos: 1,
        },
      },
    ]);

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error in getReports aggregation:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Update report status (approve/reject)
const updateReportStatusAdmin = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["CONFIRMED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedReport = await ReportModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedReport) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.status(200).json({ message: `Report ${status.toLowerCase()} successfully`, report: updatedReport });
  } catch (error) {
    console.error("Update report status error:", error);
    res.status(500).json({ error: "Failed to update report status" });
  }
});

// Get species stats with filters
const getSpeciesStats = asyncHandler(async (req, res) => {
  try {
    const { region, from, to } = req.query;

    const matchStage = {};

    if (from && to) {
      matchStage.date = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    if (region && region !== 'all') {
      matchStage['location.description'] = new RegExp(region, 'i');
    }

    const result = await ReportModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$species",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "species",
          localField: "_id",
          foreignField: "_id",
          as: "speciesDetails",
        },
      },
      { $unwind: "$speciesDetails" },
      {
        $project: {
          species: "$speciesDetails.CommonName",
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch species data" });
  }
});

// Get unique species names from reports
const getUniqueSpecies = asyncHandler(async (req, res) => {
  try {
    const species = await ReportModel.aggregate([
      {
        $lookup: {
          from: "species",
          localField: "species",
          foreignField: "_id",
          as: "speciesData",
        },
      },
      { $unwind: "$speciesData" },
      {
        $group: {
          _id: "$speciesData.CommonName",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          name: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json(species);
  } catch (error) {
    console.error("Error fetching unique species:", error);
    res.status(500).json({ error: "Failed to fetch species list" });
  }
});

// Get unique regions from reports
const getUniqueRegions = asyncHandler(async (req, res) => {
  try {
    const regions = await ReportModel.aggregate([
      {
        $group: {
          _id: "$location.description",
          count: { $sum: 1 }
        }
      },
      { $match: { _id: { $ne: null, $ne: "" } } }, // Exclude null/empty regions
      { $sort: { count: -1 } },
      {
        $project: {
          name: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json(regions);
  } catch (error) {
    console.error("Error fetching unique regions:", error);
    res.status(500).json({ error: "Failed to fetch regions list" });
  }
});

const getAllReportsResearcher = asyncHandler(async (req, res) => {
  try {
    const reports = await ReportModel.find();

    // Extract all species IDs
    const speciesIds = reports.map((r) => r.species);

    // Fetch species details in a single query
    const speciesList = await SpeciesModel.find({ _id: { $in: speciesIds } })
      .select('CommonName ProtectionLevel ScientificName ImageURL Description');

    // Create a lookup map for quick access
    const speciesMap = speciesList.reduce((acc, sp) => {
      acc[sp._id.toString()] = sp;
      return acc;
    }, {});

    // Merge manually
    const enrichedReports = reports.map((r) => ({
      ...r.toObject(),
      species: speciesMap[r.species?.toString()] || null,
    }));

    res.status(200).json(enrichedReports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ error: err.message });
  }
});

const exportFilteredReports = asyncHandler(async (req, res) => {
  try {
    const reports = req.body; // frontend sends filteredReports array

    if (!reports || reports.length === 0) {
      return res.status(400).json({ error: 'No reports provided for export.' });
    }

    // Initialize PDF
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res
        .writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=Filtered_Incident_Report.pdf',
          'Content-Length': pdfData.length,
        })
        .end(pdfData);
    });

    // --- Header ---
    doc.fontSize(26).fillColor('#146C94').text('AquaShield', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(18).fillColor('black').text('Incident Reports', { align: 'center' });
    doc.moveDown(1);

    // --- Table Style ---
    reports.forEach((report, index) => {
      const species = report.species || {};
      const location = report.location || {};

      // Report title bar
      doc
        .rect(doc.x, doc.y, 540, 20)
        .fill(index % 2 === 0 ? '#AFD3E2' : '#F6F1F1'); // alternating row colors
      doc.fillColor('black').fontSize(14).text(
        `${index + 1}. ${species.CommonName || 'Unknown'}`,
        { continued: false, align: 'left', lineGap: 2, underline: true }
      );
      doc.moveDown(0.3);

      // Report details
      doc.fontSize(12).fillColor('black');
      doc.text(`Scientific Name   : ${species.ScientificName || 'Unknown'}`);
      doc.text(`Protection Level : ${species.ProtectionLevel || 'N/A'}`);
      doc.text(`Incident Type    : ${report.incidentType || 'N/A'}`);
      doc.text(`Location         : ${location.description || 'N/A'}`);
      doc.text(`Date             : ${report.date ? new Date(report.date).toISOString().split('T')[0] : 'N/A'}`);
      doc.text(`Report Status    : ${report.status || 'N/A'}`);
      // Species description
      if (species.Description) {
        doc.fontSize(12).fillColor('#333').font('Times-Italic')
          .text(`Description: ${species.Description}`, { lineGap: 2 });
        doc.moveDown(0.5);
        doc.font('Helvetica'); // reset to normal font
      }

      doc.moveDown(1);

      // Separator line
      doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke('#CCCCCC');
      doc.moveDown(1);
    });

    // --- Footer ---
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(10).fillColor('gray').text(`Page ${i + 1} of ${pageCount}`, 0, doc.page.height - 40, {
        align: 'center',
      });
    }

    doc.end();
  } catch (err) {
    console.error('Error exporting filtered reports:', err);
    res.status(500).json({ error: 'Failed to export filtered reports' });
  }
});

export {
  createNewReport,
  getSubmittedReports,
  getAllReports,
  reportFilterBySatatus,
  getIncidentTypes,
  updateReports,
  getSpecificReports,
  getRecentReports,
  getTrendData,
  getSpeciesData,
  getMonthlyStats,
  getMonthlyFrequency,
  getStatusData,
  getKeyMetrics,
  getHotspots,
  getReports,
  getSpeciesStats,
  getUniqueSpecies,
  getUniqueRegions,
  updateReportStatusAdmin,
  getAllReportsDashboard,
  getAllReportsResearcher,
  exportFilteredReports,
  deleteSubmitReport,
  updateReportStatus
};
