import { body } from 'express-validator';

export const createRideValidator = [
  body('pickup.address')
    .notEmpty()
    .withMessage('Pickup address is required'),
  body('pickup.location.coordinates')
    .isArray()
    .withMessage('Pickup coordinates must be an array'),
  body('destination.address')
    .notEmpty()
    .withMessage('Destination address is required'),
  body('destination.location.coordinates')
    .isArray()
    .withMessage('Destination coordinates must be an array'),
  body('vehicleType')
    .isIn(['car', 'motorcycle', 'auto'])
    .withMessage('Invalid vehicle type')
];