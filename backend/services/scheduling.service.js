import ScheduledRide from '../models/scheduledRide.model.js';
import { findNearbyDrivers } from './driver.service.js';
import { estimateFare } from './fare.service.js';
import { sendPushNotification } from './notification.service.js';
import { predictSurgePricing } from './ml.service.js';
import { socket } from '../server.js';

export const scheduleRide = async (userId, rideData) => {
  try {
    // Validate scheduling time (must be at least 30 minutes in advance)
    const minScheduleTime = new Date(Date.now() + 30 * 60 * 1000);
    if (new Date(rideData.scheduledTime) < minScheduleTime) {
      throw new Error('Rides must be scheduled at least 30 minutes in advance');
    }

    // Estimate fare with surge pricing prediction
    const surgePricing = await predictSurgePricing(
      rideData.pickup.location,
      new Date(rideData.scheduledTime)
    );

    const fareEstimate = await estimateFare(
      rideData.pickup,
      rideData.destination,
      rideData.vehicleType
    );

    // Create scheduled ride
    const scheduledRide = await ScheduledRide.create({
      user: userId,
      pickup: rideData.pickup,
      destination: rideData.destination,
      scheduledTime: rideData.scheduledTime,
      vehicleType: rideData.vehicleType,
      estimatedFare: fareEstimate.fare * surgePricing,
      notes: rideData.notes
    });

    // Schedule driver search
    scheduleDriverSearch(scheduledRide);

    // Schedule reminders
    scheduleRideReminders(scheduledRide);

    return scheduledRide;
  } catch (error) {
    console.error('Error scheduling ride:', error);
    throw error;
  }
};

const scheduleDriverSearch = (scheduledRide) => {
  // Calculate when to start searching for drivers (15 minutes before scheduled time)
  const searchTime = new Date(scheduledRide.scheduledTime);
  searchTime.setMinutes(searchTime.getMinutes() - 15);

  const now = new Date();
  const delay = searchTime.getTime() - now.getTime();

  setTimeout(async () => {
    try {
      const drivers = await findNearbyDrivers(
        scheduledRide.pickup.location,
        scheduledRide.vehicleType
      );

      if (drivers.length > 0) {
        // Notify drivers of scheduled ride
        for (const driver of drivers) {
          await sendPushNotification(
            driver._id,
            'Scheduled Ride Available',
            'A new scheduled ride is available in your area'
          );

          socket.to(driver._id).emit('scheduled-ride-available', {
            rideId: scheduledRide._id,
            pickup: scheduledRide.pickup,
            scheduledTime: scheduledRide.scheduledTime
          });
        }
      } else {
        // Notify user if no drivers found
        await sendPushNotification(
          scheduledRide.user,
          'No Drivers Available',
          'We could not find any drivers for your scheduled ride'
        );

        // Update ride status
        await ScheduledRide.findByIdAndUpdate(
          scheduledRide._id,
          { $set: { status: 'cancelled', cancellationReason: 'No drivers available' } }
        );
      }
    } catch (error) {
      console.error('Error in scheduled driver search:', error);
    }
  }, delay);
};

const scheduleRideReminders = (scheduledRide) => {
  // Schedule reminder for 1 hour before
  const hourBefore = new Date(scheduledRide.scheduledTime);
  hourBefore.setHours(hourBefore.getHours() - 1);

  const hourDelay = hourBefore.getTime() - Date.now();
  if (hourDelay > 0) {
    setTimeout(async () => {
      await sendPushNotification(
        scheduledRide.user,
        'Upcoming Ride Reminder',
        'Your scheduled ride is in 1 hour'
      );
    }, hourDelay);
  }

  // Schedule reminder for 15 minutes before
  const fifteenBefore = new Date(scheduledRide.scheduledTime);
  fifteenBefore.setMinutes(fifteenBefore.getMinutes() - 15);

  const fifteenDelay = fifteenBefore.getTime() - Date.now();
  if (fifteenDelay > 0) {
    setTimeout(async () => {
      await sendPushNotification(
        scheduledRide.user,
        'Upcoming Ride Reminder',
        'Your scheduled ride is in 15 minutes'
      );
    }, fifteenDelay);
  }
};

export const cancelScheduledRide = async (rideId, userId, reason) => {
  try {
    const ride = await ScheduledRide.findOne({
      _id: rideId,
      user: userId,
      status: 'pending'
    });

    if (!ride) {
      throw new Error('Scheduled ride not found or cannot be cancelled');
    }

    // Check cancellation policy (e.g., must be at least 1 hour before)
    const minCancelTime = new Date(ride.scheduledTime);
    minCancelTime.setHours(minCancelTime.getHours() - 1);

    if (new Date() > minCancelTime) {
      throw new Error('Rides can only be cancelled at least 1 hour before scheduled time');
    }

    ride.status = 'cancelled';
    ride.cancellationReason = reason;
    await ride.save();

    // Notify assigned driver if any
    if (ride.driver) {
      await sendPushNotification(
        ride.driver,
        'Scheduled Ride Cancelled',
        'A scheduled ride has been cancelled by the user'
      );
    }

    return ride;
  } catch (error) {
    console.error('Error cancelling scheduled ride:', error);
    throw error;
  }
};

export const getUpcomingScheduledRides = async (userId) => {
  try {
    const rides = await ScheduledRide.find({
      user: userId,
      status: 'pending',
      scheduledTime: { $gt: new Date() }
    }).sort({ scheduledTime: 1 });

    return rides;
  } catch (error) {
    console.error('Error getting upcoming scheduled rides:', error);
    throw error;
  }
};

export const updateScheduledRide = async (rideId, userId, updates) => {
  try {
    const ride = await ScheduledRide.findOne({
      _id: rideId,
      user: userId,
      status: 'pending'
    });

    if (!ride) {
      throw new Error('Scheduled ride not found or cannot be updated');
    }

    // Check if update is allowed (e.g., must be at least 2 hours before)
    const minUpdateTime = new Date(ride.scheduledTime);
    minUpdateTime.setHours(minUpdateTime.getHours() - 2);

    if (new Date() > minUpdateTime) {
      throw new Error('Rides can only be updated at least 2 hours before scheduled time');
    }

    // Update allowed fields
    if (updates.scheduledTime) {
      ride.scheduledTime = updates.scheduledTime;
    }
    if (updates.notes) {
      ride.notes = updates.notes;
    }

    await ride.save();

    // Reschedule reminders and driver search
    scheduleRideReminders(ride);
    scheduleDriverSearch(ride);

    return ride;
  } catch (error) {
    console.error('Error updating scheduled ride:', error);
    throw error;
  }
};