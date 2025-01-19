import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

// Create socket instance with reconnection options
const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000
});

// Socket connection event handlers
socket.on('connect', () => {
  console.log('Socket connected');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

// Connect socket with user info
export const connectSocket = (userId: string, userType: 'user' | 'driver') => {
  if (!socket.connected) {
    socket.connect();
    socket.emit('join', { userId, userType });
  }
};

// Update driver location with retry mechanism
export const updateDriverLocation = (driverId: string, lat: number, lng: number) => {
  const emitWithRetry = (retries = 3) => {
    socket.emit('update-location-driver', {
      driverId,
      location: { lat, lng }
    }, (ack: any) => {
      if (!ack && retries > 0) {
        setTimeout(() => emitWithRetry(retries - 1), 1000);
      }
    });
  };

  emitWithRetry();
};

// Export socket instance
export { socket };