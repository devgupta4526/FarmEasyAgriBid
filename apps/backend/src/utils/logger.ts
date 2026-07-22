import { createLogger, format, transports } from 'winston';

const { combine, timestamp, json, colorize, simple, errors } = format;

const isDev = process.env.NODE_ENV !== 'production';

export const logger = createLogger({
  level: isDev ? 'debug' : 'info',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    isDev
      ? combine(colorize(), simple())
      : json()
  ),
  transports: [
    new transports.Console(),
  ],
  // NEVER log sensitive fields
  defaultMeta: { service: 'agribid-api' },
});
