import axios from 'axios';

export const calculateFare = async (pickup, destination, vehicleType) => {
  try {
    // Get route details from Google Maps
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${pickup.coordinates[1]},${
        pickup.coordinates[0]
      }&destination=${destination.coordinates[1]},${
        destination.coordinates[0]
      }&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    const route = response.data.routes[0];
    const distance = route.legs[0].distance.value / 1000; // Convert to kilometers
    const duration = route.legs[0].duration.value / 60; // Convert to minutes

    // Base fare by vehicle type
    const baseFares = {
      car: 5,
      motorcycle: 3,
      auto: 4
    };

    // Rate per km by vehicle type
    const ratePerKm = {
      car: 2,
      motorcycle: 1.5,
      auto: 1.8
    };

    // Rate per minute by vehicle type
    const ratePerMinute = {
      car: 0.5,
      motorcycle: 0.3,
      auto: 0.4
    };

    // Calculate fare
    const baseFare = baseFares[vehicleType];
    const distanceFare = distance * ratePerKm[vehicleType];
    const timeFare = duration * ratePerMinute[vehicleType];

    const totalFare = Math.round(baseFare + distanceFare + timeFare);

    return Math.max(totalFare, baseFares[vehicleType]); // Ensure minimum fare
  } catch (error) {
    console.error('Error calculating fare:', error);
    throw error;
  }
};

export const generateOTP = () => {
  return Math.random().toString().substr(2, 6);
};