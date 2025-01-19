import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation2, Search } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import { useAuth } from '../../hooks/useAuth';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["places"]
      });

      try {
        const google = await loader.load();
        const map = new google.maps.Map(document.getElementById("map")!, {
          center: { lat: 0, lng: 0 },
          zoom: 15,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        // Get user's current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              map.setCenter(pos);
              new google.maps.Marker({
                position: pos,
                map: map,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#4A90E2",
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: "#FFFFFF"
                }
              });
            },
            () => {
              console.error("Error: The Geolocation service failed.");
            }
          );
        }

        setMap(map);
        setLoading(false);
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setLoading(false);
      }
    };

    initMap();
  }, []);

  const handleRideRequest = () => {
    if (pickup && destination) {
      // Here you would typically:
      // 1. Validate the addresses
      // 2. Get route details
      // 3. Calculate estimated fare
      // 4. Create a ride request
      // For now, we'll just navigate to a new ride page
      navigate('/ride/new', { 
        state: { 
          pickup,
          destination
        }
      });
    }
  };

  return (
    <div className="relative h-[calc(100vh-64px)]">
      <div 
        id="map" 
        className="w-full h-full"
        style={{ filter: loading ? 'blur(4px)' : 'none' }}
      />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
        </div>
      )}

      <div className="absolute top-4 left-4 right-4">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="text-gray-400" />
              <input
                type="text"
                placeholder="Enter pickup location"
                className="w-full p-2 border-b border-gray-200 focus:outline-none focus:border-black"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Navigation2 className="text-gray-400" />
              <input
                type="text"
                placeholder="Enter destination"
                className="w-full p-2 border-b border-gray-200 focus:outline-none focus:border-black"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <button
              onClick={handleRideRequest}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              disabled={!pickup || !destination}
            >
              Request Ride
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;