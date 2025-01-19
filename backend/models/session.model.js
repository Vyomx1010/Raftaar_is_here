import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  userAgent: String,
  ipAddress: String,
  lastUsedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;