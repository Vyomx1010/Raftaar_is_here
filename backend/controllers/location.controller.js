import axios from 'axios';

export const searchLocations = async (req, res) => {
  try {
    const { query } = req.query;
    
    // Call Google Places Autocomplete API
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
      {
        params: {
          input: query,
          key: process.env.GOOGLE_MAPS_API_KEY,
          types: '(cities)',
          components: 'country:in' // Restrict to India
        }
      }
    );

    // Format response
    const predictions = response.data.predictions.map(prediction => ({
      id: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting.main_text,
      secondaryText: prediction.structured_formatting.secondary_text
    }));

    res.json(predictions);
  } catch (error) {
    console.error('Error searching locations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};