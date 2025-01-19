const BASE_FARES = {
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

export const calculateFare = (distance, vehicleType, duration = 0) => {
  // Get base fare for vehicle type
  const baseFare = BASE_FARES[vehicleType];
  
  // Calculate distance fare
  const distanceFare = distance * RATE_PER_KM[vehicleType];
  
  // Calculate time fare (if duration provided)
  const timeFare = duration * TIME_MULTIPLIER[vehicleType];
  
  // Apply surge pricing if applicable
  const surgeFactor = calculateSurgePricing();
  
  // Calculate total fare
  const totalFare = (baseFare + distanceFare + timeFare) * surgeFactor;
  
  // Round to nearest rupee
  return Math.round(totalFare);
};

const calculateSurgePricing = () => {
  const hour = new Date().getHours();
  
  // Peak hours: 8-10 AM and 5-7 PM
  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
    return 1.5; // 50% surge
  }
  
  // Late night: 11 PM - 5 AM
  if (hour >= 23 || hour <= 5) {
    return 1.25; // 25% surge
  }
  
  return 1.0; // No surge
};