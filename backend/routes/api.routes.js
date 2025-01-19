import express from 'express';
import { signup, signin } from '../controllers/auth.controller.js';
import { getNotifications, markAsRead } from '../controllers/notification.controller.js';
import { searchLocations } from '../controllers/location.controller.js';
import { auth } from '../middleware/auth.js';
import { validateSignup, validateSignin } from '../validators/auth.validator.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

// Auth routes
router.post('/auth/signup', validateSignup, validateRequest, signup);
router.post('/auth/signin', validateSignin, validateRequest, signin);

// Notification routes
router.get('/notifications', auth, getNotifications);
router.put('/notifications/:id/read', auth, markAsRead);

// Location routes
router.get('/locations/search', searchLocations);

export default router;