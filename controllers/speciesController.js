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
