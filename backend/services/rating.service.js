import Rating from '../models/rating.model.js';
import Driver from '../models/driver.model.js';
import User from '../models/user.model.js';

export const createRating = async (rideId, raterId, ratedId, rating, comment, type) => {
  try {
    const ratingDoc = await Rating.create({
      ride: rideId,
      rater: raterId,
      rated: ratedId,
      rating,
      comment,
      type // 'driver' or 'user'
    });

    // Update average rating
    if (type === 'driver') {
      await updateDriverRating(ratedId);
    } else {
      await updateUserRating(ratedId);
    }

    return ratingDoc;
  } catch (error) {
    console.error('Error creating rating:', error);
    throw error;
  }
};

const updateDriverRating = async (driverId) => {
  try {
    const ratings = await Rating.find({ rated: driverId, type: 'driver' });
    const avgRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;

    await Driver.findByIdAndUpdate(driverId, {
      $set: { rating: avgRating }
    });
  } catch (error) {
    console.error('Error updating driver rating:', error);
    throw error;
  }
};

const updateUserRating = async (userId) => {
  try {
    const ratings = await Rating.find({ rated: userId, type: 'user' });
    const avgRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;

    await User.findByIdAndUpdate(userId, {
      $set: { rating: avgRating }
    });
  } catch (error) {
    console.error('Error updating user rating:', error);
    throw error;
  }
};