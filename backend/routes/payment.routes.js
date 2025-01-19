import express from 'express';
import crypto from 'crypto';
import { auth } from '../middleware/auth.js';
import razorpay from '../config/razorpay.js';
import { Transaction } from '../models/payment.model.js';
import Ride from '../models/ride.model.js';

const router = express.Router();

// @route   POST /api/payments/create-order
// @desc    Create a new payment order
// @access  Private
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, rideId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `ride_${rideId}`,
      notes: {
        rideId,
        userId: req.user.id
      }
    };

    const order = await razorpay.orders.create(options);

    // Create transaction record
    await Transaction.create({
      user: req.user.id,
      ride: rideId,
      amount,
      type: 'payment',
      status: 'pending',
      orderId: order.id
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ message: 'Payment order creation failed' });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify payment signature
// @access  Private
router.post('/verify', auth, async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    const transaction = await Transaction.findOne({ orderId });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Verify signature
    const text = orderId + '|' + paymentId;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generated_signature !== signature) {
      transaction.status = 'failed';
      await transaction.save();
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update transaction status
    transaction.status = 'completed';
    transaction.paymentId = paymentId;
    await transaction.save();

    // Update ride status if needed
    const ride = await Ride.findById(transaction.ride);
    if (ride && ride.status === 'completed') {
      ride.paymentStatus = 'paid';
      await ride.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

// @route   GET /api/payments/transactions
// @desc    Get user's transaction history
// @access  Private
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate('ride')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;