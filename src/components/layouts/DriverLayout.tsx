import React from 'react';
import { Outlet } from 'react-router-dom';
import DriverNavbar from '../navigation/DriverNavbar';
import DriverBottomNav from '../navigation/DriverBottomNav';

const DriverLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DriverNavbar />
      <main className="container mx-auto px-4 pb-20">
        <Outlet />
      </main>
      <DriverBottomNav />
    </div>
  );
};

export default DriverLayout;