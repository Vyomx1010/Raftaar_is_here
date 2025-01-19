import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, Save, Car } from 'lucide-react';
import { useDriverAuth } from '../../hooks/useDriverAuth';
import { api } from '../../lib/axios';

const DriverProfile = () => {
  const navigate = useNavigate();
  const { driver, setDriver, logout } = useDriverAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: driver?.fullname.firstname || '',
    lastname: driver?.fullname.lastname || '',
    email: driver?.email || '',
    vehicle: {
      type: driver?.vehicle.type || 'car',
      color: driver?.vehicle.color || '',
      plate: driver?.vehicle.plate || '',
      capacity: driver?.vehicle.capacity || 4
    }
  });
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/drivers/profile', {
        fullname: {
          firstname: formData.firstname,
          lastname: formData.lastname,
        },
        email: formData.email,
        vehicle: formData.vehicle
      });

      setDriver(response.data);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Driver Profile</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.firstname}
                  onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                  disabled={!editing}
                  className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-50"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.lastname}
                  onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                  disabled={!editing}
                  className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!editing}
                className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Vehicle Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={formData.vehicle.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicle: { ...formData.vehicle, type: e.target.value }
                  })}
                  disabled={!editing}
                  className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-50"
                >
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  value={formData.vehicle.color}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicle: { ...formData.vehicle, color: e.target.value }
                  })}
                  disabled={!editing}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Plate
                </label>
                <input
                  type="text"
                  value={formData.vehicle.plate}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicle: { ...formData.vehicle, plate: e.target.value }
                  })}
                  disabled={!editing}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.vehicle.capacity}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicle: { ...formData.vehicle, capacity: parseInt(e.target.value) }
                  })}
                  disabled={!editing}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverProfile;