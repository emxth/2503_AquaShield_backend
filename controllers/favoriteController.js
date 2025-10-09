import Favorite from "../models/favoriteModel.js";

// Add to favorites
export const addFavorite = async (req, res) => {
  try {
    const { speciesId, userId } = req.body;

    // Prevent duplicate
    const existing = await Favorite.findOne({ speciesId, userId });
    if (existing) {
      return res.status(200).json({ message: "Already in favorites" });
    }

    const newFav = new Favorite({ speciesId, userId });
    await newFav.save();

    res.status(201).json({ message: "Added to favorites", favorite: newFav });
  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({ message: "Error adding favorite", error });
  }
};

// Remove from favorites
export const removeFavorite = async (req, res) => {
  try {
    const { speciesId, userId } = req.body;
    await Favorite.findOneAndDelete({ speciesId, userId });
    res.status(200).json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Remove favorite error:", error);
    res.status(500).json({ message: "Error removing favorite", error });
  }
};

// Get favorites (optional)
export const getFavorites = async (req, res) => {
  try {
    const { userId } = req.query;
    const favorites = await Favorite.find({ userId }).populate("speciesId");
    res.status(200).json(favorites);
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({ message: "Error fetching favorites", error });
  }
};