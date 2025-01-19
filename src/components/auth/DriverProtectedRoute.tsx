import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDriverAuth } from '../../hooks/useDriverAuth';
import { Loader2 } from 'lucide-react';
import { socket, connectSocket } from '../../lib/socket';

interface DriverProtectedRouteProps {
  children: React.ReactNode;
}

const DriverProtectedRoute: React.FC<DriverProtectedRouteProps> = ({ children }) => {
  const { driver, loading } = useDriverAuth();
  const location = useLocation();

  useEffect(() => {
    if (driver) {
      connectSocket(driver.id, 'driver');
    }

    return () => {
      socket.disconnect();
    };
  }, [driver]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!driver) {
    return <Navigate to="/driver/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default DriverProtectedRoute;