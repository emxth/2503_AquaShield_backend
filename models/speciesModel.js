import mongoose from "mongoose";

const SpeciesSchema = new mongoose.Schema(
    {
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
    },
    { timestamps: true }
);

const Species = mongoose.model("Species", SpeciesSchema);
export default Species;
