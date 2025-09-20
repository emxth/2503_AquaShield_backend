import { Schema, model } from "mongoose";

const reportSchema = new Schema({
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
            default: "Point"
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        },
        description: {
            type: String,
            required: true,
        }
    },
    date: { type: Date, default: Date.now },
    time: { type: TimeRanges, default: TimeRanges },
    incidentType: {
        type: String,
        enum: [
            "Fishing without license",
            "Fishing in restricted area",
            "Using explosives",
            "Using cyanide",
            "Using banned nets",
            "Catching undersized fish",
            "Exceeding quota",
            "Targeting endangered species",
            "Illegal fish trade",
            "Foreign vessel intrusion"
        ],
        required: true
    },
    species: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'species',
        required: true
    },
    description: { type: String },
    evidencePhotos: [
        {
            url: { type: String, required: true },
            public_id: { type: String, required: true },
        },
    ],
});

// Add geospatial index for location
incidentSchema.index({ location: "2dsphere" });

export default model("report", incidentSchema);

