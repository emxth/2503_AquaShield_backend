import mongoose from "mongoose";

const SpeciesHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String, // "created", "updated", "deleted"
      required: true,
    },
    speciesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Species",
      required: false,
    },
    details: {
      type: Object, // store snapshot of species data or updated fields
    },
    performedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const SpeciesHistory = mongoose.model("SpeciesHistory", SpeciesHistorySchema);
export default SpeciesHistory;