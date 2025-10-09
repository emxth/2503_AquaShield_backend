import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema({
  speciesId: { type: mongoose.Schema.Types.ObjectId, ref: "Species", required: true },
  userId: { type: String, required: false }, // optional if you track users
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Favorite", FavoriteSchema);