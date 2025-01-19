import Driver from '../models/driver.model.js';
import { calculateDistance } from '../utils/distance.js';

const MAX_SEARCH_RADIUS = 5000; // 5 kilometers
const MIN_RATING = 4.0;

export const findNearbyDrivers = async (location, vehicleType, maxDistance = MAX_SEARCH_RADIUS) => {
  try {
    const drivers = await Driver.find({
      status: 'active',
      'vehicle.type': vehicleType,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.coordinates[0], location.coordinates[1]]
          },
          $maxDistance: maxDistance
        }
      }
    })
    .sort({ rating: -1 })
    .limit(5);

    return drivers;
  } catch (error) {
    console.error('Error finding nearby drivers:', error);
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

    return driver;
  } catch (error) {
    console.error('Error updating driver location:', error);
    throw error;
  }
};

export const updateDriverStatus = async (driverId, status) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      driverId,
      { $set: { status } },
      { new: true }
    );

    return driver;
  } catch (error) {
    console.error('Error updating driver status:', error);
    throw error;
  }
};

export const calculateDriverEarnings = async (driverId, timeframe = 'daily') => {
  try {
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default: // daily
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    const earnings = await Ride.aggregate([
      {
        $match: {
          driver: driverId,
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalEarnings: { $sum: '$fare' },
          rides: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    return earnings;
  } catch (error) {
    console.error('Error calculating driver earnings:', error);
    throw error;
  }
};