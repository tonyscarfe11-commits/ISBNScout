import winston from 'winston';

/**
 * Structured logger using Winston
 * Replaces console.log/error/warn with proper logging levels
 */

const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'isbnscout-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Write all logs to console (stdout/stderr)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          let msg = `${timestamp} [${level}]: ${message}`;

          // Add metadata if present
          const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
          if (metaStr && metaStr !== '{}') {
            msg += `\n${metaStr}`;
          }

          return msg;
        })
      ),
    }),
  ],
});

// In production, also log to files
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

/**
 * Helper functions for common logging patterns
 */
export const log = {
  info: (message: string, meta?: Record<string, any>) => logger.info(message, meta),
  error: (message: string, error?: Error | Record<string, any>) => {
    if (error instanceof Error) {
      logger.error(message, { error: error.message, stack: error.stack });
    } else {
      logger.error(message, error);
    }
  },
  warn: (message: string, meta?: Record<string, any>) => logger.warn(message, meta),
  debug: (message: string, meta?: Record<string, any>) => logger.debug(message, meta),

  // HTTP request logging
  http: (method: string, path: string, statusCode: number, duration: number, meta?: Record<string, any>) => {
    logger.http(`${method} ${path} ${statusCode} ${duration}ms`, meta);
  },
};

// Create logs directory if it doesn't exist (production only)
if (process.env.NODE_ENV === 'production') {
  import('fs').then((fs) => {
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
  });
}

export default logger;
