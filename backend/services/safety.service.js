import { sendPushNotification } from './notification.service.js';
import { sendSMS } from './otp.service.js';

export const initializeSafetyMonitoring = (ride) => {
  // Monitor for unusual route deviations
  monitorRouteDeviation(ride);
  
  // Monitor for extended stops
  monitorExtendedStops(ride);
  
  // Monitor speed
  monitorSpeed(ride);
  
  // Set up SOS handling
  setupSOSHandler(ride);
};

const monitorRouteDeviation = (ride) => {
  let lastLocation = null;
  let deviationCount = 0;

  socket.on(`driver-location-${ride._id}`, async (location) => {
    if (lastLocation) {
      const isOnRoute = await checkIfOnRoute(location, ride.destination.location);
      if (!isOnRoute) {
        deviationCount++;
        if (deviationCount >= 3) {
          // Alert user of significant route deviation
          sendPushNotification(
            ride.user,
            'Route Alert',
            'Your driver has deviated from the optimal route'
          );
        }
      } else {
        deviationCount = 0;
      }
    }
    lastLocation = location;
  });
};

const monitorExtendedStops = (ride) => {
  let stopStartTime = null;
  let isMoving = true;

  socket.on(`driver-location-${ride._id}`, (location) => {
    const speed = location.speed || 0;
    
    if (speed < 1 && isMoving) {
      stopStartTime = Date.now();
      isMoving = false;
    } else if (speed >= 1) {
      stopStartTime = null;
      isMoving = true;
    }

    if (stopStartTime && Date.now() - stopStartTime > 5 * 60 * 1000) { // 5 minutes
      sendPushNotification(
        ride.user,
        'Extended Stop',
        'Your ride has been stopped for over 5 minutes'
      );
    }
  });
};

const monitorSpeed = (ride) => {
  const SPEED_LIMIT = 80; // km/h

  socket.on(`driver-location-${ride._id}`, (location) => {
    const speed = location.speed || 0;
    if (speed > SPEED_LIMIT) {
      sendPushNotification(
        ride.user,
        'Speed Alert',
        'Your driver is exceeding the speed limit'
      );
    }
  });
};

const setupSOSHandler = (ride) => {
  socket.on(`sos-${ride._id}`, async ({ userId, location }) => {
    try {
      // Send SOS alerts
      await Promise.all([
        // Alert emergency contacts
        alertEmergencyContacts(userId, location),
        // Alert nearby law enforcement
        alertLawEnforcement(location, ride),
        // Send SMS to user's emergency contacts
        sendEmergencyContactSMS(userId, location)
      ]);

      // Update ride status
      ride.status = 'emergency';
      await ride.save();
    } catch (error) {
      console.error('Error handling SOS:', error);
    }
  });
};

const alertEmergencyContacts = async (userId, location) => {
  const user = await User.findById(userId).populate('emergencyContacts');
  
  for (const contact of user.emergencyContacts) {
    await sendSMS(
      contact.phoneNumber,
      `EMERGENCY: ${user.fullname.firstname} ${user.fullname.lastname} has triggered an SOS alert during their ride. Location: https://maps.google.com/?q=${location.lat},${location.lng}`
    );
  }
};

const alertLawEnforcement = async (location, ride) => {
  // Implementation would depend on integration with local law enforcement APIs
  console.log('Alerting law enforcement:', { location, ride });
};