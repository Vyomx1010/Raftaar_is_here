import { socket } from '../server.js';
import { calculateDistance } from './ml.service.js';
import { sendPushNotification } from './notification.service.js';

export const initializeRideTracking = (ride) => {
  let lastLocation = null;
  let totalDistance = 0;

  // Listen for driver location updates
  socket.on(`driver-location-${ride._id}`, async (location) => {
    try {
      if (lastLocation) {
        const distance = calculateDistance(
          [lastLocation.lng, lastLocation.lat],
          [location.lng, location.lat]
        );
        totalDistance += distance;
      }
      lastLocation = location;

      // Emit location update to user
      socket.to(ride.user.toString()).emit('driver-location-updated', {
        location,
        totalDistance,
        estimatedArrival: calculateETA(location, ride.destination.location)
      });

      // Check if driver has arrived at pickup
      if (ride.status === 'accepted') {
        const distanceToPickup = calculateDistance(
          [location.lng, location.lat],
          ride.pickup.location.coordinates
        );
        
        if (distanceToPickup <= 0.1) { // 100 meters
          sendPushNotification(
            ride.user,
            'Driver Arrived',
            'Your driver has arrived at the pickup location'
          );
        }
      }

      // Check if ride is complete
      if (ride.status === 'ongoing') {
        const distanceToDestination = calculateDistance(
          [location.lng, location.lat],
          ride.destination.location.coordinates
        );
        
        if (distanceToDestination <= 0.1) { // 100 meters
          sendPushNotification(
            ride.user,
            'Approaching Destination',
            'You are almost at your destination'
          );
        }
      }
    } catch (error) {
      console.error('Error processing location update:', error);
    }
  });
};

const calculateETA = (currentLocation, destination) => {
  const distance = calculateDistance(
    [currentLocation.lng, currentLocation.lat],
    destination.coordinates
  );
  
  // Assume average speed of 30 km/h
  const timeInHours = distance / 30;
  return Math.round(timeInHours * 60); // Convert to minutes
};