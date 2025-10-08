import Species from "../models/speciesModel.js";
import cloudinary from "../config/speciesCloudinary.js";
import streamifier from "streamifier";
import SpeciesHistory from "../models/speciesHistoryModel.js";

//-----
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// Helper function: Create and send a PDF
const generatePDFReport = async (res, title, data) => {
  try {
    const doc = new PDFDocument({ margin: 40 });
    const filename = `${title.replace(/\s/g, "_")}.pdf`;
    const filePath = path.join("uploads", filename);

    // Ensure folder exists
    if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Title
    doc.fontSize(20).fillColor("#146C94").text(title, { align: "center" });
    doc.moveDown(1);

    // Table headers
    doc.fontSize(12).fillColor("black");
    doc.text("Scientific Name", 50, doc.y, { continued: true });
    doc.text("Common Name", 200, doc.y, { continued: true });
    doc.text("Category", 350, doc.y, { continued: true });
    doc.text("Protection Level", 450, doc.y);
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.8);

    // Data rows
    data.forEach((s) => {
      doc.text(s.ScientificName || "-", 50, doc.y, { continued: true });
      doc.text(s.CommonName || "-", 200, doc.y, { continued: true });
      doc.text(s.SpeciesCategory || "-", 350, doc.y, { continued: true });
      doc.text(s.ProtectionLevel || "-", 450, doc.y);
      doc.moveDown(0.5);
    });

    doc.end();

    stream.on("finish", () => {
      res.download(filePath, filename, (err) => {
        if (err) console.error("PDF download error:", err);
        fs.unlinkSync(filePath); // delete after sending
      });
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ message: "Error generating PDF report", error });
  }
};

// --- Individual Reports ---
export const getEndangeredReport = async (req, res) => {
  try {
    const endangeredSpecies = await Species.find({
      ProtectionLevel: { $regex: /^endangered$/i },
    });
    await generatePDFReport(res, "Endangered Species Report", endangeredSpecies);
  } catch (error) {
    res.status(500).json({ message: "Error generating endangered report", error });
  }
};

export const getExtinctReport = async (req, res) => {
  try {
    const extinctSpecies = await Species.find({
      ProtectionLevel: { $regex: /^extinct$/i },
    });
    await generatePDFReport(res, "Extinct Species Report", extinctSpecies);
  } catch (error) {
    res.status(500).json({ message: "Error generating extinct report", error });
  }
};

export const getVulnerableReport = async (req, res) => {
  try {
    const vulnerableSpecies = await Species.find({
      ProtectionLevel: { $regex: /^vulnerable$/i },
    });
    await generatePDFReport(res, "Vulnerable Species Report", vulnerableSpecies);
  } catch (error) {
    res.status(500).json({ message: "Error generating vulnerable report", error });
  }
};
//--

// Add Species
export const addSpecies = async (req, res) => {
  try {

    const {
      scientificName,
      commonName,
      speciesCategory,
      protectionLevel,
      habitat,
      protectionStatus,
      description,
      updatedDate,
    } = req.body;

    let imageURL = "";

    //upload to cloudinary as a stram - it is stored in buffer bu multer
    if (req.file) {
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "species-images" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };
      const result = await streamUpload(req);
      imageURL = result.secure_url;
    }
    else if (req.body.ImageURL) {
      // Case 2: Image URL provided directly
      imageURL = req.body.ImageURL;
    } else {
      // Optional: No image provided
      imageURL = null;
    }


    const newSpecies = new Species({
      ScientificName: scientificName,
      CommonName: commonName,
      SpeciesCategory: speciesCategory,
      ProtectionLevel: protectionLevel,
      Habitat: habitat,
      ProtectionStatus: protectionStatus === "true" || protectionStatus === true,
      updatedDate: updatedDate || Date.now(),
      ImageURL: imageURL,
      Description: description,
    });

    await newSpecies.save();

    // Record history
    await SpeciesHistory.create({
      action: `Added new species - ${newSpecies.ScientificName}`,
      speciesId: newSpecies._id,
      details: newSpecies,
    });

    res.status(201).json({ message: "Species added successfully", data: newSpecies });
  } catch (error) {
    console.error("Add species error:", error);
    res.status(500).json({ message: "Error adding species", error });
  }
};

// Get all species
export const getSpecies = async (req, res) => {
  try {
    const species = await Species.find();
    res.status(200).json(species);
  } catch (error) {
    console.error("Get species error:", error);
    res.status(500).json({ message: "Error fetching species", error });
  }
};

// Get one species by ID
export const getSpeciesById = async (req, res) => {
  try {
    const { id } = req.params;
    const species = await Species.findById(id);

    if (!species) {
      return res.status(404).json({ message: "Species not found" });
    }

    res.status(200).json(species);
  } catch (error) {
    console.error("Get species by ID error:", error);
    res.status(500).json({ message: "Error fetching species", error });
  }
};

// Delete Species by ID (safe version)
export const deleteSpecies = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSpecies = await Species.findByIdAndDelete(id);

    if (!deletedSpecies) {
      return res.status(404).json({ message: "Species not found" });
    }

    // Record history
    await SpeciesHistory.create({
      action: `Deleted species - ${deletedSpecies.CommonName || deletedSpecies.ScientificName}`,
      speciesId: id,
      details: deletedSpecies,
    });

    res.status(200).json({ message: "Species deleted successfully" });
  } catch (error) {
    console.error("Delete species error:", error);
    res.status(500).json({ message: "Error deleting species", error });
  }
};


// Update Species
export const updateSpecies = async (req, res) => {
  try {
    const { id } = req.params;

    // Find species by ID
    const species = await Species.findById(id);
    if (!species) return res.status(404).json({ message: "Species not found" });

    // Update fields
    const {
      ScientificName,
      CommonName,
      SpeciesCategory,
      ProtectionLevel,
      Habitat,
      updatedDate,
      ProtectionStatus,
      Description,
    } = req.body;

    species.ScientificName = ScientificName || species.ScientificName;
    species.CommonName = CommonName || species.CommonName;
    species.SpeciesCategory = SpeciesCategory || species.SpeciesCategory;
    species.ProtectionLevel = ProtectionLevel || species.ProtectionLevel;
    species.Habitat = Habitat || species.Habitat;
    species.updatedDate = updatedDate || species.updatedDate;

    species.Description = Description || species.Description;

    if (ProtectionStatus !== undefined) {
      species.ProtectionStatus = ProtectionStatus === "true" || ProtectionStatus === true;
    }

    // Handle image if uploaded
    if (req.file) {
      const streamUpload = (req) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "species-images" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const result = await streamUpload(req);
      species.ImageURL = result.secure_url;
    }

    // Save updated species
    const updatedSpecies = await species.save();

    // Record history
    await SpeciesHistory.create({
      action: "updated",
      speciesId: updatedSpecies._id,
      details: req.body, // store only updated fields
    });

    res.status(200).json(updatedSpecies);
  } catch (error) {
    console.error("Error updating species:", error);
    res.status(500).json({ message: "Failed to update species", error });
  }
};

// Get Dashboard Statistics
export const getSpeciesDashboard = async (req, res) => {
  try {
    const speciesList = await Species.find();

    // Total species count
    const totalCount = speciesList.length;

    // Endangered / Common / Protected distribution
    const endangeredCount = speciesList.filter(s => s.ProtectionLevel?.toLowerCase() === "endangered").length;
    const protectedCount = speciesList.filter(s => s.ProtectionStatus === true).length;
    const commonCount = totalCount - endangeredCount - protectedCount;

    // Recently added (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentCount = speciesList.filter(s => new Date(s.createdAt) >= oneWeekAgo).length;

    // Line chart: species added by month
    const monthlyData = {};
    speciesList.forEach(species => {
      const month = new Date(species.createdAt).toLocaleString("default", { month: "short" });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    const lineData = Object.keys(monthlyData).map(month => ({
      month,
      count: monthlyData[month],
    }));

    res.status(200).json({
      totalCount,
      endangeredCount,
      protectedCount,
      commonCount,
      recentCount,
      lineData,
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
};

// Get all species activity history (latest first)
export const getSpeciesHistory = async (req, res) => {
  try {
    const history = await SpeciesHistory.find()
      .sort({ createdAt: -1 })
      .limit(10) // only last 10 activities
      .populate("speciesId", "ScientificName CommonName");

    res.status(200).json(history);
  } catch (error) {
    console.error("Get species history error:", error);
    res.status(500).json({ message: "Error fetching species history", error });
  }
};


// Search Species by name or protection level
export const searchSpecies = async (req, res) => {
  try {
    const { query, protectionLevel, page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;

    const searchFilter = {};

    // Search by scientific or common name
    if (query) {
      searchFilter.$or = [
        { ScientificName: { $regex: query, $options: "i" } },
        { CommonName: { $regex: query, $options: "i" } },
      ];
    }

    // Filter by protection level
    if (protectionLevel && protectionLevel !== "All") {
      searchFilter.ProtectionLevel = protectionLevel;
    }

    const species = await Species.find(searchFilter)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Species.countDocuments(searchFilter);

    res.status(200).json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      species,
    });
  } catch (error) {
    console.error("Search species error:", error);
    res.status(500).json({ message: "Error searching species", error });
  }
};

// Live search suggestions (returns only names)
export const getSpeciesSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(200).json([]); // no suggestions for empty query
    }

    const suggestions = await Species.find({
      $or: [
        { ScientificName: { $regex: query, $options: "i" } },
        { CommonName: { $regex: query, $options: "i" } },
      ],
    })
      .limit(5)
      .select("ScientificName CommonName");

    res.status(200).json(suggestions);
  } catch (error) {
    console.error("Suggestions error:", error);
    res.status(500).json({ message: "Error fetching suggestions" });
  }
};

