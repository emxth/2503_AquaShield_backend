import express from 'express';
import { addFavorite, removeFavorite, getFavorites } from '../controllers/favoriteController.js';

const router = express.Router();

// Add a favorite
router.post('/', addFavorite);

// Remove a favorite
router.delete('/', removeFavorite);

// Get all favorites (optionally filter by user later)
router.get('/', getFavorites);

export default router;