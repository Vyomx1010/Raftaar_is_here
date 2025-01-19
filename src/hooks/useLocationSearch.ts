import { useState } from 'react';
import { api } from '../lib/axios';

interface Location {
  id: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export const useLocationSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Location[]>([]);

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/locations/search?query=${encodeURIComponent(query)}`);
      setSuggestions(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error searching locations');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    suggestions,
    searchLocations
  };
};