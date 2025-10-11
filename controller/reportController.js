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
        } 

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
});

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

})

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

export const updateReports = asyncHandler(async (req, res) => {
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

// const exportFilteredReports = asyncHandler(async (req, res) => {
//   try {
//     const reports = req.body; // frontend sends filteredReports array

//     if (!reports || reports.length === 0) {
//       return res.status(400).json({ error: 'No reports provided for export.' });
//     }

//     // Generate PDF
//     const doc = new PDFDocument({ margin: 30, size: 'A4' });
//     let buffers = [];
//     doc.on('data', buffers.push.bind(buffers));
//     doc.on('end', () => {
//       const pdfData = Buffer.concat(buffers);
//       res
//         .writeHead(200, {
//           'Content-Type': 'application/pdf',
//           'Content-Disposition': 'attachment; filename=Filtered_Incident_Report.pdf',
//           'Content-Length': pdfData.length,
//         })
//         .end(pdfData);
//     });

//     doc.fontSize(24).text('AquaShield', { align: 'left' });
//     doc.fontSize(18).text('Incident Reports', { align: 'center' });
//     doc.moveDown(1);

//     reports.forEach((report, index) => {
//       const species = report.species || {};
//       const location = report.location || {};

//       doc.fontSize(14).fillColor('blue').text(`${index + 1}. ${species.CommonName || 'Unknown'}`);
//       doc.fontSize(12).fillColor('black');
//       doc.text(`Scientific Name: ${species.ScientificName || 'Unknown'}`);
//       doc.text(`Protection Level: ${species.ProtectionLevel || 'N/A'}`);
//       doc.text(`Incident Type: ${report.incidentType || 'N/A'}`);
//       doc.text(`Location: ${location.description || 'N/A'}`);
//       doc.text(`Date: ${report.date ? new Date(report.date).toISOString().split('T')[0] : 'N/A'}`);
//       doc.text(`Report Status: ${report.status || 'N/A'}`);
//       doc.moveDown(1);
//     });

//     doc.end();
//   } catch (err) {
//     console.error('Error exporting filtered reports:', err);
//     res.status(500).json({ error: 'Failed to export filtered reports' });
//   }
// }); 

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
    deleteReport,
    getAllReportsDashboard,
    getAllReportsResearcher,
    exportFilteredReports
    deleteSubmitReport,
    getSpecificReports,
    updateReportStatus
};