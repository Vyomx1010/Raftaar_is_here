import express from 'express';
import apiRoutes from './api.routes.js';
import userRoutes from './user.routes.js';
import driverRoutes from './driver.routes.js';
import rideRoutes from './ride.routes.js';
import paymentRoutes from './payment.routes.js';
import notificationRoutes from './notification.routes.js';
import mapRoutes from './map.routes.js';

const router = express.Router();

// API Routes
router.use('/', apiRoutes);

// User Routes
router.use('/users', userRoutes);

// Driver Routes
router.use('/drivers', driverRoutes);

// Ride Routes
router.use('/rides', rideRoutes);

// Payment Routes
router.use('/payments', paymentRoutes);

// Notification Routes
router.use('/notifications', notificationRoutes);

// Map Routes
router.use('/maps', mapRoutes);

export default router;