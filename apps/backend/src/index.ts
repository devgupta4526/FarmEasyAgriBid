import 'dotenv/config';
import { createApp } from './app';
import { createServer } from 'http';
import { initSocket } from './socket/socket';
import { logger } from './utils/logger';
import { pool } from './db/pool';

const PORT = parseInt(process.env.PORT || '4000', 10);

async function bootstrap() {
  // Verify DB connection
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    logger.info('✅ Database connected');
  } catch (err) {
    logger.error('❌ Database connection failed', { error: err });
    process.exit(1);
  }

  const app = createApp();
  const httpServer = createServer(app);

  // Initialize Socket.IO for real-time features
  initSocket(httpServer);

  httpServer.listen(PORT, '127.0.0.1', () => {
    logger.info(`🚀 AgriBid API running on port ${PORT}`, {
      env: process.env.NODE_ENV,
      port: PORT,
    });
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received – shutting down gracefully`);
    httpServer.close(async () => {
      await pool.end();
      logger.info('Server and DB pool closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Fatal bootstrap error', { error: err });
  process.exit(1);
});
