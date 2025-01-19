import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userType = socket.handshake.auth.userType;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id} (${socket.userType})`);

    socket.join(socket.userId);

    if (socket.userType === 'driver') {
      handleDriverSocket(socket);
    } else {
      handleUserSocket(socket);
    }

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      handleDisconnect(socket);
    });
  });

  return io;
};

const handleDriverSocket = (socket) => {
  socket.on('driver:status', async (status) => {
    try {
      await updateDriverStatus(socket.userId, status);
      socket.emit('driver:status:updated', status);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  socket.on('driver:location', async (location) => {
    try {
      await updateDriverLocation(socket.userId, location);
      socket.broadcast.emit('driver:location:updated', {
        driverId: socket.userId,
        location
      });
    } catch (error) {
      socket.emit('error', error.message);
    }
  });
};

const handleUserSocket = (socket) => {
  socket.on('ride:request', async (data) => {
    try {
      const ride = await createRideRequest(socket.userId, data);
      socket.emit('ride:created', ride);
      notifyNearbyDrivers(ride);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  socket.on('ride:cancel', async (rideId) => {
    try {
      const ride = await cancelRide(rideId, socket.userId);
      socket.emit('ride:cancelled', ride);
      if (ride.driver) {
        io.to(ride.driver.toString()).emit('ride:cancelled', ride);
      }
    } catch (error) {
      socket.emit('error', error.message);
    }
  });
};

const handleDisconnect = async (socket) => {
  if (socket.userType === 'driver') {
    try {
      await updateDriverStatus(socket.userId, 'offline');
    } catch (error) {
      console.error('Error updating driver status:', error);
    }
  }
};

export const notifyNearbyDrivers = async (ride) => {
  try {
    const nearbyDrivers = await findNearbyDrivers(ride.pickup.location, ride.vehicleType);
    
    for (const driver of nearbyDrivers) {
      io.to(driver._id.toString()).emit('ride:available', {
        rideId: ride._id,
        pickup: ride.pickup,
        destination: ride.destination,
        fare: ride.fare
      });
    }
  } catch (error) {
    console.error('Error notifying nearby drivers:', error);
  }
};

export const emitToUser = (userId, event, data) => {
  io.to(userId.toString()).emit(event, data);
};

export const emitToDriver = (driverId, event, data) => {
  io.to(driverId.toString()).emit(event, data);
};