import express from 'express';
import { auth } from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();

// @route   GET /api/maps/geocode
// @desc    Geocode an address
// @access  Private
router.get('/geocode', auth, async (req, res) => {
  try {
    const { address } = req.query;
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error geocoding address:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/maps/directions
// @desc    Get directions between two points
// @access  Private
router.get('/directions', auth, async (req, res) => {
  try {
    const { origin, destination } = req.query;
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(
        destination
      )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching directions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;