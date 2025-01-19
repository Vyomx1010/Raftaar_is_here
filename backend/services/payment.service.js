import crypto from 'crypto';
import razorpay from '../config/razorpay.js';
import { Transaction } from '../models/payment.model.js';
import FareSplit from '../models/fareSplit.model.js';

export const createPaymentOrder = async (amount, rideId, userId) => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `ride_${rideId}`,
      notes: {
        rideId,
        userId
      }
    };

    const order = await razorpay.orders.create(options);

    // Create transaction record
    await Transaction.create({
      user: userId,
      ride: rideId,
      amount,
      type: 'payment',
      status: 'pending',
      orderId: order.id
    });

    return order;
  } catch (error) {
    console.error('Error creating payment order:', error);
    throw error;
  }
};

export const verifyPayment = async (orderId, paymentId, signature) => {
  try {
    const transaction = await Transaction.findOne({ orderId });
    if (!transaction) {
      throw new Error('Transaction not found');
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
      throw new Error('Invalid payment signature');
    }

    // Update transaction status
    transaction.status = 'completed';
    transaction.paymentId = paymentId;
    await transaction.save();

    return transaction;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

export const createFareSplit = async (rideId, initiatorId, participants, splitType = 'equal') => {
  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }

    const totalAmount = ride.fare;
    const splitAmount = splitType === 'equal' 
      ? totalAmount / participants.length 
      : totalAmount;

    const fareSplit = await FareSplit.create({
      ride: rideId,
      initiator: initiatorId,
      participants: participants.map(userId => ({
        user: userId,
        amount: splitType === 'equal' ? splitAmount : 0,
        status: 'pending'
      })),
      totalAmount,
      splitType,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    return fareSplit;
  } catch (error) {
    console.error('Error creating fare split:', error);
    throw error;
  }
};

export const updateFareSplitStatus = async (fareSplitId, userId, status) => {
  try {
    const fareSplit = await FareSplit.findOneAndUpdate(
      {
        _id: fareSplitId,
        'participants.user': userId
      },
      {
        $set: {
          'participants.$.status': status
        }
      },
      { new: true }
    );

    // Check if all participants have paid
    const allPaid = fareSplit.participants.every(p => p.status === 'paid');
    if (allPaid) {
      fareSplit.status = 'completed';
      await fareSplit.save();
    }

    return fareSplit;
  } catch (error) {
    console.error('Error updating fare split status:', error);
    throw error;
  }
};

export const processRefund = async (transactionId, amount, reason) => {
  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Create refund in Razorpay
    const refund = await razorpay.payments.refund(transaction.paymentId, {
      amount: Math.round(amount * 100), // Convert to paise
      notes: {
        reason,
        originalTransactionId: transaction._id
      }
    });

    // Create refund transaction record
    const refundTransaction = await Transaction.create({
      user: transaction.user,
      ride: transaction.ride,
      amount: amount,
      type: 'refund',
      status: 'completed',
      paymentId: refund.id,
      description: reason,
      metadata: {
        originalTransactionId: transaction._id
      }
    });

    return refundTransaction;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};

export const getTransactionHistory = async (userId, filters = {}) => {
  try {
    const query = { user: userId };

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.startDate && filters.endDate) {
      query.createdAt = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }

    const transactions = await Transaction.find(query)
      .populate('ride')
      .sort({ createdAt: -1 });

    return transactions;
  } catch (error) {
    console.error('Error getting transaction history:', error);
    throw error;
  }
};