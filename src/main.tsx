import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Initialize environment variables with fallbacks
const ENV = {
  VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',
  VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  VITE_RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID
};

// Validate environment variables
const missingVars = Object.entries(ENV)
  .filter(([key, value]) => !value && key !== 'NODE_ENV')
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.warn(
    'Warning: Some environment variables are missing, using fallback values:\n',
    missingVars.map(key => `- ${key}`).join('\n')
  );
}

// Initialize the app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);