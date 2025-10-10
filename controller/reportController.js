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
};