import { sendPushNotification } from './notification.service.js';
import { sendSMS } from './otp.service.js';
import User from '../models/user.model.js';
import Driver from '../models/driver.model.js';
import EmergencyContact from '../models/emergencyContact.model.js';
import { socket } from '../server.js';

export const handleEmergency = async (rideId, userId, location) => {
  try {
    // Get user and emergency contacts
    const user = await User.findById(userId);
    const emergencyContacts = await EmergencyContact.find({ user: userId });
    const ride = await Ride.findById(rideId).populate('driver');

    // Send notifications to emergency contacts
    for (const contact of emergencyContacts) {
      await sendSMS(
        contact.phoneNumber,
        `EMERGENCY: ${user.fullname.firstname} ${user.fullname.lastname} has triggered an SOS alert. ` +
        `Location: https://maps.google.com/?q=${location.lat},${location.lng}`
      );

      if (contact.email) {
        // Send email notification
        await sendEmergencyEmail(
          contact.email,
          user,
          location,
          ride
        );
      }
    }

    // Notify nearby law enforcement
    await notifyLawEnforcement(location, {
      rideId,
      userId,
      driverId: ride.driver?._id,
      vehicleInfo: ride.driver?.vehicle
    });

    // Send push notification to user confirming help is on the way
    await sendPushNotification(
      userId,
      'Emergency Response',
      'Help is on the way. Stay calm and remain in your location if safe.'
    );

    // Update ride status
    await updateRideEmergencyStatus(rideId);

    // Notify driver about emergency
    if (ride.driver) {
      await sendPushNotification(
        ride.driver._id,
        'Emergency Alert',
        'Emergency services have been notified. Please remain at your current location.'
      );
    }

    // Emit emergency event to relevant parties
    socket.to(userId).emit('emergency:initiated', { location });
    if (ride.driver) {
      socket.to(ride.driver._id).emit('emergency:initiated', { location });
    }

    return true;
  } catch (error) {
    console.error('Error handling emergency:', error);
    throw error;
  }
};

const notifyLawEnforcement = async (location, rideInfo) => {
  try {
    // This would integrate with local emergency services API
    // For now, we'll just log the notification
    console.log('Emergency notification sent to law enforcement:', {
      location,
      rideInfo,
      timestamp: new Date()
    });

    // In a real implementation, this would make API calls to emergency services
    // const response = await axios.post('emergency-service-api', {
    //   type: 'RIDE_EMERGENCY',
    //   location,
    //   rideInfo
    // });

    return true;
  } catch (error) {
    console.error('Error notifying law enforcement:', error);
    throw error;
  }
};

const sendEmergencyEmail = async (email, user, location, ride) => {
  try {
    const emailData = {
      to: email,
      subject: 'EMERGENCY ALERT - Ride Emergency',
      html: `
        <h1>Emergency Alert</h1>
        <p>An emergency has been reported for:</p>
        <p><strong>User:</strong> ${user.fullname.firstname} ${user.fullname.lastname}</p>
        <p><strong>Location:</strong> <a href="https://maps.google.com/?q=${location.lat},${location.lng}">View on Map</a></p>
        <p><strong>Ride ID:</strong> ${ride._id}</p>
        ${ride.driver ? `
          <p><strong>Driver:</strong> ${ride.driver.fullname.firstname} ${ride.driver.fullname.lastname}</p>
          <p><strong>Vehicle:</strong> ${ride.driver.vehicle.color} ${ride.driver.vehicle.type} (${ride.driver.vehicle.plate})</p>
        ` : ''}
        <p>Emergency services have been notified.</p>
      `
    };

    // Send email using your email service
    // await sendEmail(emailData);
    console.log('Emergency email sent:', emailData);

    return true;
  } catch (error) {
    console.error('Error sending emergency email:', error);
    throw error;
  }
};

const updateRideEmergencyStatus = async (rideId) => {
  try {
    const ride = await Ride.findByIdAndUpdate(
      rideId,
      {
        $set: {
          status: 'emergency',
          emergencyReportedAt: new Date()
        }
      },
      { new: true }
    );

    return ride;
  } catch (error) {
    console.error('Error updating ride emergency status:', error);
    throw error;
  }
};

export const resolveEmergency = async (rideId, resolution) => {
  try {
    const ride = await Ride.findByIdAndUpdate(
      rideId,
      {
        $set: {
          status: 'resolved',
          emergencyResolvedAt: new Date(),
          emergencyResolution: resolution
        }
      },
      { new: true }
    );

    // Notify user and driver
    await sendPushNotification(
      ride.user,
      'Emergency Resolved',
      'The emergency situation has been resolved.'
    );

    if (ride.driver) {
      await sendPushNotification(
        ride.driver,
        'Emergency Resolved',
        'The emergency situation has been resolved.'
      );
    }

    return ride;
  } catch (error) {
    console.error('Error resolving emergency:', error);
    throw error;
  }
};