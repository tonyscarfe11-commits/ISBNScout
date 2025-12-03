import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import connectPgSimple from "connect-pg-simple";
import cors from "cors";
import helmet from "helmet";
import { registerRoutes } from "./routes/index";
import { setupVite, serveStatic, log } from "./vite";
import { apiLimiter } from "./middleware/rate-limit";
import { initSentry, sentryErrorHandler } from "./sentry";

const app = express();

// Initialize error tracking
initSentry(app);

// Enable trust proxy for Replit
app.set('trust proxy', 1);

// CORS configuration
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  // Development: Allow all origins for easier testing
  console.log('[CORS] Development mode - allowing all origins');
  app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['X-CSRF-Token'], // Allow client to read CSRF token from response headers
  }));
} else {
  // Production: Whitelist specific origins only
  const allowedOrigins = [
    'https://isbnscout.com',
    'https://www.isbnscout.com',
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      // SECURITY NOTE: This is safe because:
      // 1. Requests without origin cannot be forged by malicious websites (browser security)
      // 2. CSRF protection middleware handles requests WITH origin
      // 3. Mobile apps and server-to-server calls naturally have no origin
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in whitelist
      const isAllowed = allowedOrigins.includes(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['X-CSRF-Token'], // Allow client to read CSRF token from response headers
  }));
}

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Tailwind
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Allow inline scripts for Vite in dev
        "https://us-assets.i.posthog.com", // PostHog analytics
      ],
      imgSrc: ["'self'", "data:", "https:", "http:"], // Allow external images
      connectSrc: [
        "'self'",
        "https:",
        "http:", // Allow API calls
        "https://us.i.posthog.com", // PostHog API
        "https://app.posthog.com", // PostHog API
      ],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for external images
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Apply global rate limiting to all API routes
app.use('/api', apiLimiter);

// Import CSRF middleware after app initialization
import { requireCsrfToken, provideCsrfToken } from './middleware/csrf';

// Session configuration
const isDevelopment = process.env.NODE_ENV === 'development';

// Use PostgreSQL session store in production, memory store in development
let sessionStore;
if (process.env.DATABASE_URL) {
  // Production: PostgreSQL session store for persistence
  const PgSession = connectPgSimple(session);
  sessionStore = new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'session', // Table name for sessions
    createTableIfMissing: true, // Auto-create table
    pruneSessionInterval: 60 * 15, // Cleanup expired sessions every 15 minutes
  });
  console.log('[Session] Using PostgreSQL session store');
} else {
  // Development: Memory store (sessions lost on restart)
  const MemoryStoreSession = MemoryStore(session);
  sessionStore = new MemoryStoreSession({
    checkPeriod: 86400000, // 24 hours
  });
  console.log('[Session] Using memory session store (development only)');
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: false, // Don't save session if unmodified (changed from true for efficiency)
    saveUninitialized: false, // Don't create session until something stored (security best practice)
    rolling: true, // Reset expiry on every request
    store: sessionStore,
    cookie: {
      secure: true, // Always secure (Replit uses HTTPS proxy)
      httpOnly: true, // ✅ SECURITY: Prevent JavaScript access (XSS protection)
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'none', // Required for Replit webview cross-origin cookies
      path: '/', // Ensure cookie is available for all paths
    },
    proxy: true, // Trust the reverse proxy
  })
);

// Log session configuration
log(`Session configured: secure=true, httpOnly=true, sameSite=none, maxAge=30days, proxy=true, resave=false, store=${process.env.DATABASE_URL ? 'PostgreSQL' : 'Memory'}`);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Log cookie presence for debugging
  if (path.startsWith("/api")) {
    const hasCookie = !!req.headers.cookie;
    const hasSessionCookie = req.headers.cookie?.includes('connect.sid');
    if (!hasCookie && path !== "/api/auth/login" && path !== "/api/auth/signup") {
      log(`⚠️  No cookie in request to ${path}`);
    } else if (hasCookie && !hasSessionCookie && path !== "/api/auth/login" && path !== "/api/auth/signup") {
      log(`⚠️  Cookie present but no session cookie in request to ${path}`);
    }
  }

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      // Add session debug info
      const sessionId = req.sessionID;
      const userId = (req.session as any)?.userId;
      const setCookieHeader = res.getHeader('Set-Cookie');

      if (sessionId) {
        logLine += ` [sid:${sessionId.substring(0, 8)}...]`;
      }
      if (userId) {
        logLine += ` [user:${userId}]`;
      } else if (path !== "/api/auth/login" && path !== "/api/auth/signup" && path.startsWith("/api")) {
        logLine += ` [NO USER]`;
      }

      // Log if Set-Cookie header is being sent
      if (setCookieHeader) {
        logLine += ` [Cookie-SET]`;
      }

      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 150) {
        logLine = logLine.slice(0, 149) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // CSRF token endpoint - must be before registerRoutes
  app.get('/api/csrf-token', provideCsrfToken, (req, res) => {
    res.json({ csrfToken: res.locals.csrfToken });
  });

  // Apply CSRF protection globally to all state-changing API operations
  // This is applied before routes so it protects all endpoints
  app.use('/api', requireCsrfToken);

  const server = await registerRoutes(app);

  // Sentry error handler (must be before other error handlers)
  app.use(sentryErrorHandler());

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
