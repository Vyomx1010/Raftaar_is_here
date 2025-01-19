import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired'],
    default: 'pending'
  },
  rewards: {
    referrer: {
      type: Number,
      required: true
    },
    referred: {
      type: Number,
      required: true
    }
  },
  completedAt: Date
}, {
  timestamps: true
});

const Referral = mongoose.model('Referral', referralSchema);

export default Referral;