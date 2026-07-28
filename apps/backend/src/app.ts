import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import auctionRoutes from './routes/auction.routes';
import orderRoutes from './routes/order.routes';
import walletRoutes from './routes/wallet.routes';
import chatRoutes from './routes/chat.routes';
import reviewRoutes from './routes/review.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';
import logisticsRoutes from './routes/logistics.routes';
import aiRoutes from './routes/ai.routes';
import categoryRoutes from './routes/category.routes';
import wishlistRoutes from './routes/wishlist.routes';
import uploadRoutes from './routes/upload.routes';

export function createApp(): Application {
  const app = express();

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // CORS
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

  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || isOriginAllowed(origin)) return cb(null, true);
      cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  }));

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: (req) => req.url === '/health',
  }));

  // Global rate limit
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  });
  app.use('/api/', globalLimiter);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
  });

  // API routes
  const v1 = '/api/v1';
  app.use(`${v1}/auth`, authRoutes);
  app.use(`${v1}/users`, userRoutes);
  app.use(`${v1}/products`, productRoutes);
  app.use(`${v1}/categories`, categoryRoutes);
  app.use(`${v1}/auctions`, auctionRoutes);
  app.use(`${v1}/orders`, orderRoutes);
  app.use(`${v1}/wallet`, walletRoutes);
  app.use(`${v1}/chat`, chatRoutes);
  app.use(`${v1}/reviews`, reviewRoutes);
  app.use(`${v1}/notifications`, notificationRoutes);
  app.use(`${v1}/admin`, adminRoutes);
  app.use(`${v1}/logistics`, logisticsRoutes);
  app.use(`${v1}/ai`, aiRoutes);
  app.use(`${v1}/wishlist`, wishlistRoutes);
  app.use(`${v1}/upload`, uploadRoutes);

  // 404
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
