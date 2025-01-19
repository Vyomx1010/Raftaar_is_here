import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.error('Google Maps API key is missing. Please check your environment variables.');
}

export const loadGoogleMaps = async () => {
  try {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"]
    });

    return await loader.load();
  } catch (error) {
    console.error('Error loading Google Maps:', error);
    throw new Error('Failed to load Google Maps. Please check your API key and try again.');
  }
};