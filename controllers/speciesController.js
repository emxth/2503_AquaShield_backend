import Species from "../models/speciesModel.js";
import cloudinary from "../config/speciesCloudinary.js";
import streamifier from "streamifier";

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

