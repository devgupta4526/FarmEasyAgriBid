import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  const configuredOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,
    'https://agribid.vercel.app',
    'https://farm-easy-agri-bid-web.vercel.app',
  ].filter((url): url is string => Boolean(url));

  const isOriginAllowed = (origin: string): boolean => {
    if (configuredOrigins.includes(origin)) return true;
    if (/\.vercel\.app$/.test(origin)) return true;
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
    if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;
    return false;
  };

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || isOriginAllowed(origin)) return callback(null, true);
        callback(new Error(`Socket CORS disallowed: ${origin}`));
      },
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // JWT authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
    if (!token) {
      // Allow unauthenticated connections for public auction rooms
      socket.data.userId = null;
      return next();
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
        sub: string; role: string;
      };
      socket.data.userId = payload.sub;
      socket.data.role = payload.role;
      next();
    } catch {
      socket.data.userId = null;
      next(); // Allow with no user
    }
  });

  io.on('connection', (socket) => {
    logger.debug('Socket connected', { socketId: socket.id, userId: socket.data.userId });

    // Join auction room
    socket.on('join_auction', (auctionId: string) => {
      socket.join(`auction:${auctionId}`);
      logger.debug('Joined auction room', { socketId: socket.id, auctionId });
    });

    // Leave auction room
    socket.on('leave_auction', (auctionId: string) => {
      socket.leave(`auction:${auctionId}`);
    });

    // Join chat room
    socket.on('join_chat', (roomId: string) => {
      if (!socket.data.userId) return;
      socket.join(`chat:${roomId}`);
    });

    // Leave chat room
    socket.on('leave_chat', (roomId: string) => {
      socket.leave(`chat:${roomId}`);
    });

    // Typing indicator
    socket.on('typing', ({ roomId, isTyping }: { roomId: string; isTyping: boolean }) => {
      if (!socket.data.userId) return;
      socket.to(`chat:${roomId}`).emit('user_typing', {
        userId: socket.data.userId,
        isTyping,
      });
    });

    // Driver location update (logistics)
    socket.on('driver_location', ({ orderId, lat, lng }: { orderId: string; lat: number; lng: number }) => {
      if (!socket.data.userId || socket.data.role !== 'logistics') return;
      io?.to(`order:${orderId}`).emit('driver_location_update', { lat, lng, timestamp: new Date() });
    });

    socket.on('disconnect', () => {
      logger.debug('Socket disconnected', { socketId: socket.id });
    });
  });

  logger.info('✅ Socket.IO initialized');
  return io;
}

export function getIO(): Server | null {
  return io;
}
