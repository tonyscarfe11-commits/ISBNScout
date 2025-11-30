import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

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
    allowedHeaders: ['Content-Type', 'Authorization'],
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
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
const MemoryStoreSession = MemoryStore(session);
const isDevelopment = process.env.NODE_ENV === 'development';

// Check if request is from mobile app or browser
// We'll set this dynamically per-request, but default to auto (lets browser decide)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: true, // Force session to be saved back to store
    saveUninitialized: true, // Force session to be saved even if unmodified
    rolling: true, // Reset expiry on every request
    store: new MemoryStoreSession({
      checkPeriod: 86400000, // 24 hours
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true, // ✅ SECURITY: Prevent JavaScript access (XSS protection)
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: isDevelopment ? 'lax' : 'strict', // ✅ SECURITY: CSRF protection
      path: '/', // Ensure cookie is available for all paths
    },
    proxy: true, // Trust the reverse proxy
  })
);

// Log session configuration
log(`Session configured: secure=${process.env.NODE_ENV === 'production'}, httpOnly=true, sameSite=${isDevelopment ? 'lax' : 'strict'}, maxAge=30days, proxy=true, resave=true`);

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
  const server = await registerRoutes(app);

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
