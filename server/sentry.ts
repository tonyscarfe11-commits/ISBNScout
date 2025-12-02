import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import type { Express } from "express";

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

  // The request handler must be the first middleware
  app.use(Sentry.Handlers.requestHandler());

  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());

  console.log(`[Sentry] Error tracking initialized for ${process.env.NODE_ENV} environment`);
}

/**
 * Sentry error handler - must be used after all routes
 * but before any other error middleware
 */
export function sentryErrorHandler() {
  if (!isSentryInitialized) {
    // Return a no-op middleware if Sentry is not initialized
    return (_req: any, _res: any, next: any) => next();
  }
  return Sentry.Handlers.errorHandler();
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
