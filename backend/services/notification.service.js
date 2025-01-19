import admin from '../config/firebase.js';
import twilio from 'twilio';
import { Notification } from '../models/notification.model.js';
import User from '../models/user.model.js';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmToken) return;

    const message = {
      notification: {
        title,
        body
      },
      data,
      token: user.fcmToken
    };

    await admin.messaging().send(message);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

export const sendSMS = async (phoneNumber, message) => {
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};

export const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data
    });

    // Send push notification if user has FCM token
    await sendPushNotification(userId, title, message, data);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const getUnreadNotifications = async (userId) => {
  try {
    return await Notification.find({
      user: userId,
      readAt: null
    }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { $set: { readAt: new Date() } },
      { new: true }
    );

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId) => {
  try {
    await Notification.updateMany(
      { user: userId, readAt: null },
      { $set: { readAt: new Date() } }
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const deleteOldNotifications = async (days = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    await Notification.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
  } catch (error) {
    console.error('Error deleting old notifications:', error);
    throw error;
  }
};

export const sendRideNotification = async (ride, type) => {
  try {
    let title, message;

    switch (type) {
      case 'driver_assigned':
        title = 'Driver Assigned';
        message = `${ride.driver.fullname.firstname} is on their way to pick you up.`;
        break;
      case 'driver_arrived':
        title = 'Driver Arrived';
        message = 'Your driver has arrived at the pickup location.';
        break;
      case 'ride_started':
        title = 'Ride Started';
        message = 'Your ride has begun.';
        break;
      case 'ride_completed':
        title = 'Ride Completed';
        message = 'Your ride has been completed. Rate your experience!';
        break;
      case 'ride_cancelled':
        title = 'Ride Cancelled';
        message = 'Your ride has been cancelled.';
        break;
      default:
        return;
    }

    await createNotification(ride.user, type, title, message, { rideId: ride._id });
  } catch (error) {
    console.error('Error sending ride notification:', error);
    throw error;
  }
};