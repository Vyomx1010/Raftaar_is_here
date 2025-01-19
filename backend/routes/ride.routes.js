import express from 'express';
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createRideValidator } from '../validators/ride.validator.js';
import { requestRide } from '../services/ride.service.js';
import { initializeRideTracking } from '../services/tracking.service.js';
import { initializeSafetyMonitoring } from '../services/safety.service.js';
import Ride from '../models/ride.model.js';
import { socket } from '../server.js';

const router = express.Router();

// @route   POST /api/rides
// @desc    Create a new ride request
// @access  Private
router.post('/', [auth, createRideValidator, validateRequest], async (req, res) => {
  try {
    const { pickup, destination, vehicleType } = req.body;

    const ride = await requestRide(req.user.id, pickup, destination, vehicleType);
    
    // Initialize ride tracking and safety monitoring
    initializeRideTracking(ride);
    initializeSafetyMonitoring(ride);

    res.status(201).json(ride);
  } catch (error) {
    console.error('Error creating ride:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/rides
// @desc    Get user's ride history
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const rides = await Ride.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('driver', 'fullname vehicle');

    res.json(rides);
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/rides/:id
// @desc    Get single ride details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'fullname vehicle')
      .populate('user', 'fullname');

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user is authorized to view this ride
    if (ride.user.toString() !== req.user.id && ride.driver?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(ride);
  } catch (error) {
    console.error('Error fetching ride:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/rides/:id/cancel
// @desc    Cancel a ride
// @access  Private
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!['pending', 'accepted'].includes(ride.status)) {
      return res.status(400).json({ message: 'Ride cannot be cancelled' });
    }

    ride.status = 'cancelled';
    ride.cancellationReason = reason;
    await ride.save();

    // Notify driver if already assigned
    if (ride.driver) {
      socket.to(ride.driver.toString()).emit('ride-cancelled', {
        rideId: ride._id,
        reason
      });
    }

    res.json({ message: 'Ride cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling ride:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/rides/:id/accept
// @desc    Driver accepts a ride
// @access  Private
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const ride = await Ride.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { 
        $set: { 
          driver: req.user.id,
          status: 'accepted',
          acceptedAt: new Date()
        }
      },
      { new: true }
    ).populate('driver', 'fullname vehicle');

    if (!ride) {
      return res.status(400).json({ message: 'Ride not available' });
    }

    // Notify user
    socket.to(ride.user.toString()).emit('ride-accepted', ride);

    res.json(ride);
  } catch (error) {
    console.error('Error accepting ride:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/rides/:id/start
// @desc    Start a ride
// @access  Private
router.post('/:id/start', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (ride.status !== 'accepted') {
      return res.status(400).json({ message: 'Ride cannot be started' });
    }

    ride.status = 'ongoing';
    ride.startedAt = new Date();
    await ride.save();

    // Notify user
    socket.to(ride.user.toString()).emit('ride-started', ride);

    res.json(ride);
  } catch (error) {
    console.error('Error starting ride:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/rides/:id/complete
// @desc    Complete a ride
// @access  Private
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (ride.status !== 'ongoing') {
      return res.status(400).json({ message: 'Ride cannot be completed' });
    }

    ride.status = 'completed';
    ride.completedAt = new Date();
    await ride.save();

    // Notify user
    socket.to(ride.user.toString()).emit('ride-completed', ride);

    res.json(ride);
  } catch (error) {
    console.error('Error completing ride:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/rides/:id/sos
// @desc    Trigger SOS alert
// @access  Private
router.post('/:id/sos', auth, async (req, res) => {
  try {
    const { location } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.user.toString() !== req.user.id && ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Emit SOS event
    socket.emit(`sos-${ride._id}`, {
      userId: req.user.id,
      location,
      isDriver: ride.driver.toString() === req.user.id
    });

    // Update ride status
    ride.status = 'emergency';
    ride.emergencyReportedAt = new Date();
    await ride.save();

    res.json({ message: 'SOS alert triggered' });
  } catch (error) {
    console.error('Error triggering SOS:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/rides/:id/rate
// @desc    Rate a completed ride
// @access  Private
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed rides' });
    }

    // Determine if user is rating driver or passenger
    const isDriver = ride.driver.toString() === req.user.id;
    const ratingField = isDriver ? 'driverRating' : 'userRating';
    const commentField = isDriver ? 'driverComment' : 'userComment';

    ride[ratingField] = rating;
    ride[commentField] = comment;
    await ride.save();

    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;