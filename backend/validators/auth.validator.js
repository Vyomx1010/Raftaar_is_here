import { body } from 'express-validator';

export const validateSignup = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullname.firstname')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long'),
  body('fullname.lastname')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long')
];

export const validateSignin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .exists()
    .withMessage('Password is required')
];