import SpeciesRequest from "../models/speciesRequest.js";
import cloudinary from "../config/speciesCloudinary.js";
import streamifier from "streamifier";

// Add Species Request
export const addSpeciesRequest = async (req, res) => {
  try {
    const {
      requesterName,
      scientificName,
      commonName,
      speciesCategory,
      protectionLevel,
      habitat,
      protectionStatus,
      description,
      updatedDate,
      requestStatus,
    } = req.body;

    let imageURL = "";

    //upload to cloudinary as a stram - it is stored in buffer multer
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

    const newSpeciesRequest = new SpeciesRequest({
      RequesterName: requesterName,
      ScientificName: scientificName,
      CommonName: commonName,
      SpeciesCategory: speciesCategory,
      ProtectionLevel: protectionLevel,
      Habitat: habitat,
      ProtectionStatus: protectionStatus === "true" || protectionStatus === true,
      updatedDate: updatedDate || Date.now(),
      ImageURL: imageURL,
      Description: description,
      RequestStatus: requestStatus
    });

    await newSpeciesRequest.save();
    res.status(201).json({ message: "Species request added successfully", data: newSpeciesRequest });
  } catch (error) {
    console.error("Add species request error:", error);
    res.status(500).json({ message: "Error adding species request", error });
  }
};

// Get all species
export const getSpeciesRequest = async (req, res) => {
  try {
    const speciesRequest = await SpeciesRequest.find();
    res.status(200).json(speciesRequest);
  } catch (error) {
    console.error("Get species request error:", error);
    res.status(500).json({ message: "Error fetching species request", error });
  }
};

// Get one species by ID
export const getSpeciesRequestById = async (req, res) => {
  try {
    const { speciesId } = req.params;
    const speciesRequest = await SpeciesRequest.findById(speciesId);

    if (!speciesRequest) {
      return res.status(404).json({ message: "Species request not found" });
    }

    res.status(200).json(speciesRequest);
  } catch (error) {
    console.error("Get species request by ID error:", error);
    res.status(500).json({ message: "Error fetching species requests", error });
  }
};

// Delete Species by ID (safe version)
export const deleteSpeciesRequest = async (req, res) => {
  try {
    const { speciesId } = req.params;

    const deletedSpeciesRequest = await SpeciesRequest.findByIdAndDelete(speciesId);

    if (!deletedSpeciesRequest) {
      return res.status(404).json({ message: "Species request not found" });
    }

    res.status(200).json({ message: "Species request deleted successfully" });
  } catch (error) {
    console.error("Delete species request error:", error);
    res.status(500).json({ message: "Error deleting species", error });
  }
};

//UPDATE
export const updateSpeciesRequest = async (req, res) => {
  try {
    const { speciesId } = req.params;

    // Find species by ID
    const speciesRequest = await SpeciesRequest.findById(speciesId);
    if (!speciesRequest) {
      return res.status(404).json({ message: "Species request not found" });
    }

    // Pull incoming fields (all will be strings if form-data)
    const {
      ScientificName,
      CommonName,
      SpeciesCategory,
      ProtectionLevel,
      Habitat,
      updatedDate,
      ProtectionStatus,
      Description,
      RequestStatus,
      ImageURL, // if front-end sends an ImageURL string
    } = req.body;

    // Update only when provided (preserve existing otherwise)
    if (ScientificName !== undefined) speciesRequest.ScientificName = ScientificName;
    if (CommonName !== undefined) speciesRequest.CommonName = CommonName;
    if (SpeciesCategory !== undefined) speciesRequest.SpeciesCategory = SpeciesCategory;
    if (ProtectionLevel !== undefined) speciesRequest.ProtectionLevel = ProtectionLevel;
    if (Habitat !== undefined) speciesRequest.Habitat = Habitat;
    if (Description !== undefined) speciesRequest.Description = Description;
    if (RequestStatus !== undefined) speciesRequest.RequestStatus = RequestStatus;

    if (updatedDate !== undefined && updatedDate !== "") {
      const dt = new Date(updatedDate);
      if (!isNaN(dt.getTime())) speciesRequest.updatedDate = dt;
    }

    if (ProtectionStatus !== undefined) {
      // ProtectionStatus may arrive as "true"/"false" or boolean
      speciesRequest.ProtectionStatus =
        ProtectionStatus === "true" || ProtectionStatus === true;
    }

    // Handle image upload via multer (req.file.buffer) -> upload to Cloudinary
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
      speciesRequest.ImageURL = result.secure_url;
    } else if (ImageURL !== undefined && ImageURL !== "") {
      // If client provided an ImageURL string explicitly, set it
      speciesRequest.ImageURL = ImageURL;
    } // else: leave existing ImageURL as-is

    // Save the updated instance (instance.save(), not Model.save())
    const updatedSpeciesRequest = await speciesRequest.save();

    return res.status(200).json(updatedSpeciesRequest);
  } catch (error) {
    console.error("Error updating species request:", error);
    return res
      .status(500)
      .json({ message: "Failed to update species request", error: error.message || error });
  }
};


// Update only RequestStatus
export const updateSpeciesRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { RequestStatus } = req.body;

    const updated = await SpeciesRequest.findByIdAndUpdate(
      id,
      { RequestStatus },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Species request not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Failed to update request status" });
  }
};

// Update only RequestMessage
export const updateSpeciesRequestMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { RequestMessage } = req.body;

    if (!RequestMessage) {
      return res.status(400).json({ message: "RequestMessage is required" });
    }

    const updated = await SpeciesRequest.findByIdAndUpdate(
      id,
      { RequestMessage },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Species request not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating request message:", error);
    res.status(500).json({ message: "Failed to update request message" });
  }
};

