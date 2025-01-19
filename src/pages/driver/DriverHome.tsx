import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation2, Power } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import { useDriverAuth } from '../../hooks/useDriverAuth';
import { socket, connectSocket, updateDriverLocation } from '../../lib/socket';
import { api } from '../../lib/axios';

const DriverHome = () => {
  const navigate = useNavigate();
  const { driver } = useDriverAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (driver) {
      connectSocket(driver.id, 'driver');
    }

    return () => {
      socket.disconnect();
    };
  }, [driver]);

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

        // Get driver's current location
        if (navigator.geolocation) {
          navigator.geolocation.watchPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              map.setCenter(pos);
              
              // Update driver location in backend
              if (driver && isOnline) {
                updateDriverLocation(driver.id, pos.lat, pos.lng);
              }

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
  }, [driver, isOnline]);

  const toggleOnlineStatus = async () => {
    try {
      const response = await api.post('/drivers/toggle-status', {
        status: isOnline ? 'inactive' : 'active'
      });
      setIsOnline(!isOnline);
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  // Listen for new ride requests
  useEffect(() => {
    socket.on('new-ride-request', (ride) => {
      setCurrentRide(ride);
      navigate(`/driver/ride/${ride.id}`);
    });

    return () => {
      socket.off('new-ride-request');
    };
  }, [navigate]);

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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Driver Dashboard</h2>
              <p className="text-gray-600">
                {isOnline ? 'You are online and can receive rides' : 'You are offline'}
              </p>
            </div>
            <button
              onClick={toggleOnlineStatus}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                ${isOnline 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'}
              `}
            >
              <Power className="w-5 h-5" />
              {isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverHome;