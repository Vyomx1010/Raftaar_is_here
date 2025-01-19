import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Pages
import Start from './pages/Start';
import UserLogin from './pages/auth/UserLogin';
import UserSignup from './pages/auth/UserSignup';
import DriverLogin from './pages/auth/DriverLogin';
import DriverSignup from './pages/auth/DriverSignup';
import Home from './pages/user/Home';
import RideHistory from './pages/user/RideHistory';
import Profile from './pages/user/Profile';
import ActiveRide from './pages/user/ActiveRide';
import DriverHome from './pages/driver/DriverHome';
import DriverProfile from './pages/driver/DriverProfile';
import DriverEarnings from './pages/driver/DriverEarnings';
import DriverActiveRide from './pages/driver/DriverActiveRide';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DriverProtectedRoute from './components/auth/DriverProtectedRoute';

// Layouts
import UserLayout from './components/layouts/UserLayout';
import DriverLayout from './components/layouts/DriverLayout';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Start />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<UserLogin />} />
      <Route path="/signup" element={<UserSignup />} />
      <Route path="/driver/login" element={<DriverLogin />} />
      <Route path="/driver/signup" element={<DriverSignup />} />

      {/* Protected User Routes */}
      <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
        <Route path="/home" element={<Home />} />
        <Route path="/rides" element={<RideHistory />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ride/:rideId" element={<ActiveRide />} />
      </Route>

      {/* Protected Driver Routes */}
      <Route element={<DriverProtectedRoute><DriverLayout /></DriverProtectedRoute>}>
        <Route path="/driver/home" element={<DriverHome />} />
        <Route path="/driver/profile" element={<DriverProfile />} />
        <Route path="/driver/earnings" element={<DriverEarnings />} />
        <Route path="/driver/ride/:rideId" element={<DriverActiveRide />} />
      </Route>
    </Routes>
  );
}

export default App;