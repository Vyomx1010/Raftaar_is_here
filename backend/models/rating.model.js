import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'raterType'
  },
  raterType: {
    type: String,
    required: true,
    enum: ['User', 'Driver']
  },
  rated: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'ratedType'
  },
  ratedType: {
    type: String,
    required: true,
    enum: ['User', 'Driver']
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String
}, {
  timestamps: true
});

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;