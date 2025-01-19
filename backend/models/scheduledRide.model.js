import mongoose from 'mongoose';

const scheduledRideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickup: {
    address: {
      type: String,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },
  destination: {
    address: {
      type: String,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['car', 'motorcycle', 'auto'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'cancelled', 'completed'],
    default: 'pending'
  },
  estimatedFare: {
    type: Number,
    required: true
  },
  notes: String,
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride'
  }
}, {
  timestamps: true
});

scheduledRideSchema.index({ 'pickup.location': '2dsphere' });
scheduledRideSchema.index({ 'destination.location': '2dsphere' });
scheduledRideSchema.index({ scheduledTime: 1 });

const ScheduledRide = mongoose.model('ScheduledRide', scheduledRideSchema);

export default ScheduledRide;