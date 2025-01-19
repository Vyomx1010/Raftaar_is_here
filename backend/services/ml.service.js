import axios from 'axios';

const calculateDistance = (point1, point2) => {
  const [lon1, lat1] = point1;
  const [lon2, lat2] = point2;
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Predict surge pricing based on historical data
export const predictSurgePricing = async (location, time) => {
  try {
    // This would typically call a machine learning model API
    // For now, we'll use a simple heuristic
    const hour = time.getHours();
    const isPeakHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);
    
    if (isPeakHour) {
      return 1.5; // 50% surge
    }
    
    return 1.0; // No surge
  } catch (error) {
    console.error('Error predicting surge pricing:', error);
    return 1.0; // Default to no surge on error
  }
};

// Predict ETA based on traffic conditions
export const predictETA = async (origin, destination, time) => {
  try {
    const distance = calculateDistance(origin, destination);
    const hour = time.getHours();
    const isPeakHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);
    
    // Base speed: 30 km/h
    let speed = 30;
    
    // Reduce speed during peak hours
    if (isPeakHour) {
      speed = 20;
    }
    
    // Calculate ETA in minutes
    const eta = Math.round((distance / speed) * 60);
    
    return eta;
  } catch (error) {
    console.error('Error predicting ETA:', error);
    throw error;
  }
};

// Predict optimal driver assignment
export const predictOptimalDriver = async (ride, availableDrivers) => {
  try {
    let bestDriver = null;
    let shortestDistance = Infinity;
    
    for (const driver of availableDrivers) {
      const distance = calculateDistance(
        driver.location.coordinates,
        ride.pickup.location.coordinates
      );
      
      if (distance < shortestDistance) {
        shortestDistance = distance;
        bestDriver = driver;
      }
    }
    
    return bestDriver;
  } catch (error) {
    console.error('Error predicting optimal driver:', error);
    throw error;
  }
};

// Predict ride cancellation probability
export const predictCancellationProbability = async (ride) => {
  try {
    // This would typically use a trained model
    // For now, use simple heuristics
    let probability = 0;
    
    // Distance factor
    const distance = calculateDistance(
      ride.pickup.location.coordinates,
      ride.destination.location.coordinates
    );
    if (distance > 20) probability += 0.2;
    
    // Time factor
    const hour = new Date(ride.createdAt).getHours();
    if (hour >= 22 || hour <= 5) probability += 0.3;
    
    // Weather factor (would need weather API integration)
    // if (isRaining) probability += 0.2;
    
    return Math.min(probability, 1);
  } catch (error) {
    console.error('Error predicting cancellation probability:', error);
    return 0;
  }
};

// Predict user rating
export const predictUserRating = async (ride) => {
  try {
    // This would typically use a trained model
    // For now, use simple heuristics
    let rating = 5;
    
    // Deduct for delays
    const delay = (new Date(ride.completedAt) - new Date(ride.createdAt)) / 1000 / 60;
    if (delay > 15) rating -= 0.5;
    if (delay > 30) rating -= 1;
    
    // Deduct for route deviation
    // Would need actual route tracking data
    // if (routeDeviation > threshold) rating -= 0.5;
    
    return Math.max(rating, 1);
  } catch (error) {
    console.error('Error predicting user rating:', error);
    return 5;
  }
};