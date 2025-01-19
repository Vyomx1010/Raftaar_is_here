import express from 'express';
import { signup, signin, googleAuth, facebookAuth } from '../controllers/auth.controller.js';
import { validateSignup, validateSignin } from '../validators/auth.validator.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.post('/signup', validateSignup, validateRequest, signup);
router.post('/signin', validateSignin, validateRequest, signin);
router.post('/google', googleAuth);
router.post('/facebook', facebookAuth);

export default router;