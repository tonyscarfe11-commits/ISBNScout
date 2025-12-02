import type { Express } from "express";
import { createServer, type Server } from "http";
import authRouter from "./auth";
import subscriptionsRouter from "./subscriptions";
import booksRouter from "./books";
import inventoryRouter from "./inventory";
import listingsRouter from "./listings";
import repricingRouter from "./repricing";
import affiliatesRouter from "./affiliates";
import aiRouter from "./ai";
import adminRouter from "./admin";
import miscRouter from "./misc";

/**
 * Register all application routes
 * Routes are now organized into logical modules for better maintainability
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Mount all route modules
  app.use("/api/auth", authRouter);
  app.use("/api/subscription", subscriptionsRouter);
  app.use("/api/webhooks", subscriptionsRouter); // Stripe webhooks are in subscriptions
  app.use("/api/books", booksRouter);
  app.use("/api/inventory", inventoryRouter);
  app.use("/api/listings", listingsRouter);
  app.use("/api/repricing", repricingRouter);
  app.use("/api/affiliates", affiliatesRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/admin", adminRouter);

  // Misc routes include: health, user, credentials, usage, trial, scans, sync, offline, proxy-image, amazon
  app.use("/api", miscRouter);

  const httpServer = createServer(app);
  return httpServer;
}
