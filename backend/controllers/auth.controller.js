import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import admin from '../config/firebase.js';
import User from '../models/user.model.js';
import { sendVerificationEmail } from '../services/email.service.js';

export const signup = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      fullname,
      email,
      password
    });

    // Generate verification token
    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Save user
    await user.save();

    // Generate auth token
    const token = user.generateToken();

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname
      },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = user.generateToken();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname
      },
      token
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Google token
    const ticket = await admin.auth().verifyIdToken(token);
    const { email, name, picture } = ticket;
    
    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      const [firstname, ...lastname] = name.split(' ');
      user = await User.create({
        email,
        fullname: {
          firstname,
          lastname: lastname.join(' ')
        },
        googleId: ticket.sub,
        profilePicture: picture,
        isEmailVerified: true
      });
    }

    // Generate token
    const authToken = user.generateToken();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname
      },
      token: authToken
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const facebookAuth = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Facebook token
    const ticket = await admin.auth().verifyIdToken(token);
    const { email, name, picture } = ticket;
    
    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      const [firstname, ...lastname] = name.split(' ');
      user = await User.create({
        email,
        fullname: {
          firstname,
          lastname: lastname.join(' ')
        },
        facebookId: ticket.sub,
        profilePicture: picture,
        isEmailVerified: true
      });
    }

    // Generate token
    const authToken = user.generateToken();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname
      },
      token: authToken
    });
  } catch (error) {
    console.error('Facebook auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};