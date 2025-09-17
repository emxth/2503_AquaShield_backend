import Species from "../models/speciesModel.js";
import cloudinary from "../config/cloudinary.js";
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