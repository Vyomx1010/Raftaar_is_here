import React from 'react';
import { Outlet } from 'react-router-dom';
import UserNavbar from '../navigation/UserNavbar';
import UserBottomNav from '../navigation/UserBottomNav';

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <main className="container mx-auto px-4 pb-20">
        <Outlet />
      </main>
      <UserBottomNav />
    </div>
  );
};

export default UserLayout;