import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, LogOut } from 'lucide-react';
import { useDriverAuth } from '../../hooks/useDriverAuth';

const DriverNavbar = () => {
  const navigate = useNavigate();
  const { driver, logout } = useDriverAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/driver/home" className="flex items-center gap-2">
            <Car className="h-8 w-8" />
            <span className="font-bold text-xl">Raftaar Driver</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link
              to="/driver/home"
              className="text-gray-700 hover:text-black transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/driver/earnings"
              className="text-gray-700 hover:text-black transition-colors"
            >
              Earnings
            </Link>
            <Link
              to="/driver/profile"
              className="text-gray-700 hover:text-black transition-colors"
            >
              Profile
            </Link>
            {driver && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DriverNavbar;