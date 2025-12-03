import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import type { Express, Request, Response, NextFunction } from "express";

let isSentryInitialized = false;

/**
 * Initialize Sentry error tracking and performance monitoring
 * Only activates if SENTRY_DSN environment variable is set
 */
export function initSentry(app: Express) {
  const sentryDsn = process.env.SENTRY_DSN;

  if (!sentryDsn) {
    console.log('[Sentry] SENTRY_DSN not set, skipping error tracking initialization');
    return;
  }

  isSentryInitialized = true;

  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      nodeProfilingIntegration(),
    ],

    // Release tracking
    release: process.env.npm_package_version || 'unknown',

    // Filter out health check noise
    beforeSend(event) {
      // Don't send health check errors
      if (event.request?.url?.includes('/api/health')) {
        return null;
      }
      return event;
    },
  });

  // Note: In Sentry SDK v8+, request/tracing handlers are set up automatically
  // The middleware setup has changed, so we'll use the setupExpressErrorHandler instead
  console.log(`[Sentry] Error tracking initialized for ${process.env.NODE_ENV} environment`);
}

/**
 * Sentry error handler - must be used after all routes
 * but before any other error middleware
 */
export function sentryErrorHandler() {
  if (!isSentryInitialized) {
    // Return a no-op middleware if Sentry is not initialized
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }
  // In Sentry SDK v8+, use setupExpressErrorHandler or manual error capture
  return (err: Error, _req: Request, res: Response, next: NextFunction) => {
    Sentry.captureException(err);
    next(err);
  };
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, { extra: context });
}

/**
 * Manually capture a message
 */
export function captureMessage(message: string, level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info') {
  Sentry.captureMessage(message, level);
}
