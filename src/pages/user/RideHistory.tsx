import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Navigation2 } from 'lucide-react';
import { api } from '../../lib/axios';

interface Ride {
  id: string;
  pickup: {
    address: string;
  };
  destination: {
    address: string;
  };
  status: string;
  fare: number;
  createdAt: string;
  driver?: {
    fullname: {
      firstname: string;
      lastname: string;
    };
    vehicle: {
      type: string;
      plate: string;
    };
  };
}

const RideHistory = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await api.get('/rides/history');
        setRides(response.data);
      } catch (error) {
        console.error('Error fetching ride history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Your Rides</h1>
      
      {rides.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No rides yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => (
            <div
              key={ride.id}
              className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/ride/${ride.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-700">{ride.pickup.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation2 className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-700">{ride.destination.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">${ride.fare.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{formatDate(ride.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div>
                  {ride.driver && (
                    <p className="text-sm text-gray-600">
                      {ride.driver.fullname.firstname} {ride.driver.fullname.lastname} •{' '}
                      {ride.driver.vehicle.type} • {ride.driver.vehicle.plate}
                    </p>
                  )}
                </div>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${ride.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                  ${ride.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                  ${ride.status === 'ongoing' ? 'bg-blue-100 text-blue-800' : ''}
                `}>
                  {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RideHistory;