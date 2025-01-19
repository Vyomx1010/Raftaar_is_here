import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Driver from '../models/driver.model.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/drivers/signup
// @desc    Register a new driver
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { fullname, email, password, vehicle } = req.body;

    let driver = await Driver.findOne({ email });
    if (driver) {
      return res.status(400).json({ message: 'Driver already exists' });
    }

    driver = new Driver({
      fullname,
      email,
      password,
      vehicle
    });

    const token = driver.generateToken();
    await driver.save();

    res.status(201).json({
      driver: {
        id: driver._id,
        email: driver.email,
        fullname: driver.fullname,
        vehicle: driver.vehicle,
        status: driver.status
      },
      token
    });
  } catch (error) {
    console.error('Error in driver signup:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/drivers/login
// @desc    Authenticate driver & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const driver = await Driver.findOne({ email }).select('+password');
    if (!driver) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await driver.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = driver.generateToken();

    res.json({
      driver: {
        id: driver._id,
        email: driver.email,
        fullname: driver.fullname,
        vehicle: driver.vehicle,
        status: driver.status
      },
      token
    });
  } catch (error) {
    console.error('Error in driver login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/drivers/profile
// @desc    Update driver profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullname, email, vehicle } = req.body;
    const driver = await Driver.findById(req.user.id);

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    driver.fullname = fullname;
    driver.email = email;
    if (vehicle) {
      driver.vehicle = vehicle;
    }

    await driver.save();

    res.json({
      id: driver._id,
      email: driver.email,
      fullname: driver.fullname,
      vehicle: driver.vehicle,
      status: driver.status
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/drivers/toggle-status
// @desc    Toggle driver's active status
// @access  Private
router.post('/toggle-status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const driver = await Driver.findById(req.user.id);

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    driver.status = status;
    await driver.save();

    res.json({ status: driver.status });
  } catch (error) {
    console.error('Error toggling status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/drivers/earnings
// @desc    Get driver's earnings
// @access  Private
router.get('/earnings', auth, async (req, res) => {
  try {
    const { timeframe = 'daily' } = req.query;
    const driver = await Driver.findById(req.user.id);

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Get completed rides for the driver
    const rides = await Ride.find({
      driver: driver._id,
      status: 'completed'
    }).sort({ createdAt: -1 });

    // Calculate earnings based on timeframe
    const earnings = calculateEarnings(rides, timeframe);
    const totalEarnings = rides.reduce((sum, ride) => sum + ride.fare, 0);
    const totalRides = rides.length;

    res.json({
      earnings,
      totalEarnings,
      totalRides
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;