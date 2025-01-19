import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Clock, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const UserBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-4 h-16">
        <Link
          to="/home"
          className={`flex flex-col items-center justify-center ${
            isActive('/home') ? 'text-black' : 'text-gray-500'
          }`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link
          to="/rides"
          className={`flex flex-col items-center justify-center ${
            isActive('/rides') ? 'text-black' : 'text-gray-500'
          }`}
        >
          <Clock className="h-6 w-6" />
          <span className="text-xs mt-1">My Rides</span>
        </Link>
        
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center ${
            isActive('/profile') ? 'text-black' : 'text-gray-500'
          }`}
        >
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center text-red-600"
        >
          <LogOut className="h-6 w-6" />
          <span className="text-xs mt-1">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default UserBottomNav;