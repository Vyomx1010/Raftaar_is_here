import { body } from 'express-validator';

export const rideRequestValidator = [
  body('pickup.address').notEmpty().withMessage('Pickup address is required'),
  body('pickup.location.coordinates').isArray().withMessage('Pickup coordinates must be an array'),
  body('destination.address').notEmpty().withMessage('Destination address is required'),
  body('destination.location.coordinates').isArray().withMessage('Destination coordinates must be an array'),
  body('vehicleType').isIn(['car', 'motorcycle', 'auto']).withMessage('Invalid vehicle type')
];

export const paymentValidator = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('rideId').isString().withMessage('Ride ID is required')
];

export const profileUpdateValidator = [
  body('fullname.firstname').optional().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('fullname.lastname').optional().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format')
];