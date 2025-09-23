import mongoose from "mongoose";

const SpeciesRequestSchema = new mongoose.Schema(
    {
        RequesterName: {
            type: String,
            required: true
        },
        ScientificName: {
            type: String,
            required: true,
            unique: true
        },
        CommonName: {
            type: String,
            required: true,
        },
        SpeciesCategory: {
            type: String
        },
        ProtectionLevel: {
            type: String
        },
        Habitat: {
            type: String
        },
        ProtectionStatus: {
            type: Boolean, 
            default: false
        },
        updatedDate: {
            type: Date, default: Date.now
        },
        ImageURL: {
            type: String
        },
        Description: {
            type: String
        },
        RequestStatus: {
            type: String
        }
    },
    { timestamps: true }
);

const SpeciesRequest = mongoose.model("SpeciesRequest", SpeciesRequestSchema);

export default SpeciesRequest;
