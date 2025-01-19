const BASE_FARE = {
  car: 50,    // Base fare in INR
  auto: 30,
  motorcycle: 25
};

const RATE_PER_KM = {
  car: 15,    // Rate per kilometer in INR
  auto: 12,
  motorcycle: 10
};

const TIME_MULTIPLIER = {
  car: 2,
  auto: 1.5,
  motorcycle: 1
};

const SURGE_MULTIPLIERS = {
  low: 1.0,
  medium: 1.3,
  high: 1.5,
  extreme: 2.0
};

export const calculateFare = (distance, duration, vehicleType, demandLevel = 'low') => {
  // Base fare for vehicle type
  let fare = BASE_FARE[vehicleType];
  
  // Add distance-based fare
  fare += distance * RATE_PER_KM[vehicleType];
  
  // Add time-based fare
  fare += duration * TIME_MULTIPLIER[vehicleType];
  
  // Apply surge pricing
  fare *= SURGE_MULTIPLIERS[demandLevel];
  
  // Round to nearest rupee
  return Math.round(fare);
};

export const calculateSurgePricing = (activeRides, availableDrivers, timeOfDay) => {
  const demandRatio = activeRides / (availableDrivers || 1);
  const hour = timeOfDay.getHours();
  
  // Peak hours: 8-10 AM and 5-7 PM
  const isPeakHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);
  
  if (demandRatio >= 2 || (isPeakHour && demandRatio >= 1.5)) {
    return 'extreme';
  } else if (demandRatio >= 1.5 || (isPeakHour && demandRatio >= 1)) {
    return 'high';
  } else if (demandRatio >= 1 || isPeakHour) {
    return 'medium';
  }
  
  return 'low';
};

export const estimateFare = async (pickup, destination, vehicleType) => {
  try {
    // Calculate route using Google Maps API
    const route = await calculateRoute(pickup, destination);
    
    const distance = route.distance.value / 1000; // Convert to kilometers
    const duration = route.duration.value / 60; // Convert to minutes
    
    // Get current demand level
    const demandLevel = await getCurrentDemandLevel(pickup);
    
    // Calculate fare
    const fare = calculateFare(distance, duration, vehicleType, demandLevel);
    
    return {
      fare,
      distance,
      duration,
      demandLevel
    };
  } catch (error) {
    console.error('Error estimating fare:', error);
    throw error;
  }
};

const calculateRoute = async (pickup, destination) => {
  // Implementation using Google Maps Directions API
  // This would be implemented with actual API calls
  return {
    distance: { value: 5000 }, // 5 km
    duration: { value: 900 }   // 15 minutes
  };
};

const getCurrentDemandLevel = async (location) => {
  // Implementation to determine current demand level
  // This would check active rides and available drivers in the area
  return 'low';
};