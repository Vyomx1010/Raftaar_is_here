import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Navigation2, Phone, MessageSquare, Car, User } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import { api } from '../../lib/axios';
import { socket } from '../../lib/socket';

interface Ride {
  id: string;
  status: string;
  pickup: {
    address: string;
    location: {
      coordinates: [number, number];
    };
  };
  destination: {
    address: string;
    location: {
      coordinates: [number, number];
    };
  };
  driver?: {
    fullname: {
      firstname: string;
      lastname: string;
    };
    vehicle: {
      type: string;
      color: string;
      plate: string;
    };
  };
  fare: number;
  otp: string;
}

const ActiveRide = () => {
  const { rideId } = useParams();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [driverMarker, setDriverMarker] = useState<google.maps.Marker | null>(null);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const response = await api.get(`/rides/${rideId}`);
        setRide(response.data);
      } catch (error) {
        console.error('Error fetching ride:', error);
      }
    };

    fetchRide();
  }, [rideId]);

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

        const directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true
        });

        setMap(map);
        setDirectionsRenderer(directionsRenderer);
        setLoading(false);

        if (ride) {
          const directionsService = new google.maps.DirectionsService();
          const origin = new google.maps.LatLng(
            ride.pickup.location.coordinates[1],
            ride.pickup.location.coordinates[0]
          );
          const destination = new google.maps.LatLng(
            ride.destination.location.coordinates[1],
            ride.destination.location.coordinates[0]
          );

          directionsService.route(
            {
              origin,
              destination,
              travelMode: google.maps.TravelMode.DRIVING
            },
            (result, status) => {
              if (status === google.maps.DirectionsStatus.OK && result) {
                directionsRenderer.setDirections(result);
              }
            }
          );

          // Add markers for pickup and destination
          new google.maps.Marker({
            position: origin,
            map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4A90E2",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#FFFFFF"
            }
          });

          new google.maps.Marker({
            position: destination,
            map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#F5A623",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#FFFFFF"
            }
          });
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setLoading(false);
      }
    };

    if (ride) {
      initMap();
    }
  }, [ride]);

  // Listen for driver location updates
  useEffect(() => {
    if (ride?.driver) {
      socket.on('driver-location-updated', (location) => {
        if (map && !driverMarker) {
          const marker = new google.maps.Marker({
            position: new google.maps.LatLng(location.lat, location.lng),
            map,
            icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: "#000000",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#FFFFFF",
              rotation: 0
            }
          });
          setDriverMarker(marker);
        } else if (driverMarker) {
          driverMarker.setPosition(new google.maps.LatLng(location.lat, location.lng));
        }
      });
    }

    return () => {
      socket.off('driver-location-updated');
    };
  }, [ride?.driver, map, driverMarker]);

  if (loading || !ride) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-64px)]">
      <div id="map" className="w-full h-full" />

      <div className="absolute bottom-0 left-0 right-0">
        <div className="bg-white rounded-t-xl shadow-lg p-4 space-y-4">
          {ride.driver ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {ride.driver.fullname.firstname} {ride.driver.fullname.lastname}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {ride.driver.vehicle.color} {ride.driver.vehicle.type} • {ride.driver.vehicle.plate}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Car className="w-6 h-6 text-gray-400" />
              <p className="text-gray-600">Finding your driver...</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              <p className="text-gray-700">{ride.pickup.address}</p>
            </div>
            <div className="flex items-center gap-2">
              <Navigation2 className="w-5 h-5 text-orange-500" />
              <p className="text-gray-700">{ride.destination.address}</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Estimated Fare</p>
              <p className="text-xl font-semibold">${ride.fare.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">OTP</p>
              <p className="text-xl font-semibold">{ride.otp}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveRide;