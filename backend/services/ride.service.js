import Driver from '../models/driver.model.js';
import Ride from '../models/ride.model.js';
import { calculateDistance } from '../utils/distance.js';
import { calculateFare } from '../utils/fare.js';
import { emitToUser, emitToDriver, notifyNearbyDrivers } from './socket.service.js';

const DRIVER_ACCEPT_TIMEOUT = 30000; // 30 seconds
const MAX_DRIVER_SEARCH_RADIUS = 5000; // 5 kilometers

export const createRideRequest = async (userId, { pickup, destination, vehicleType }) => {
  try {
    // Calculate distance and fare
    const distance = calculateDistance(pickup.location, destination.location);
    const fare = calculateFare(distance, vehicleType);

    // Create ride request
    const ride = await Ride.create({
      user: userId,
      pickup,
      destination,
      vehicleType,
      fare,
      status: 'pending'
    });

    // Find and notify nearby drivers
    await findAndNotifyDrivers(ride);

    return ride;
  } catch (error) {
    console.error('Error creating ride request:', error);
    throw error;
  }
};

const findAndNotifyDrivers = async (ride) => {
  try {
    const nearbyDrivers = await findNearbyDrivers(ride.pickup.location, ride.vehicleType);
    
    if (nearbyDrivers.length === 0) {
      await updateRideStatus(ride._id, 'cancelled', 'No drivers available');
      emitToUser(ride.user, 'ride:cancelled', { reason: 'No drivers available' });
      return;
    }

    // Set timeout for driver acceptance
    setTimeout(async () => {
      const updatedRide = await Ride.findById(ride._id);
      if (updatedRide.status === 'pending') {
        await updateRideStatus(ride._id, 'cancelled', 'No driver accepted');
        emitToUser(ride.user, 'ride:cancelled', { reason: 'No driver accepted' });
      }
    }, DRIVER_ACCEPT_TIMEOUT);

    // Notify drivers
    notifyNearbyDrivers(ride);
  } catch (error) {
    console.error('Error finding and notifying drivers:', error);
    throw error;
  }
};

export const findNearbyDrivers = async (location, vehicleType) => {
  try {
    return await Driver.find({
      status: 'active',
      'vehicle.type': vehicleType,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.coordinates[0], location.coordinates[1]]
          },
          $maxDistance: MAX_DRIVER_SEARCH_RADIUS
        }
      }
    }).limit(5);
  } catch (error) {
    console.error('Error finding nearby drivers:', error);
    throw error;
  }
};

export const acceptRide = async (rideId, driverId) => {
  try {
    const ride = await Ride.findOneAndUpdate(
      { _id: rideId, status: 'pending' },
      { 
        $set: { 
          driver: driverId,
          status: 'accepted',
          acceptedAt: new Date()
        }
      },
      { new: true }
    );

    if (!ride) {
      throw new Error('Ride not available');
    }

    emitToUser(ride.user, 'ride:accepted', ride);
    return ride;
  } catch (error) {
    console.error('Error accepting ride:', error);
    throw error;
  }
};

export const updateRideStatus = async (rideId, status, reason = '') => {
  try {
    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { 
        $set: { 
          status,
          ...(reason && { cancellationReason: reason })
        }
      },
      { new: true }
    );

    if (!ride) {
      throw new Error('Ride not found');
    }

    emitToUser(ride.user, `ride:${status}`, ride);
    if (ride.driver) {
      emitToDriver(ride.driver, `ride:${status}`, ride);
    }

    return ride;
  } catch (error) {
    console.error('Error updating ride status:', error);
    throw error;
  }
};

export const updateDriverLocation = async (driverId, location) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      driverId,
      { 
        $set: { 
          location: {
            type: 'Point',
            coordinates: [location.lng, location.lat]
          }
        }
      },
      { new: true }
    );

    if (!driver) {
      throw new Error('Driver not found');
    }

    // If driver is on a ride, notify the user
    const activeRide = await Ride.findOne({
      driver: driverId,
      status: { $in: ['accepted', 'ongoing'] }
    });

    if (activeRide) {
      emitToUser(activeRide.user, 'driver:location', location);
    }

    return driver;
  } catch (error) {
    console.error('Error updating driver location:', error);
    throw error;
  }
};