import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { redis } from "./config/redis";
import { prisma } from "./lib/prisma";
import { correlationId } from "./middleware/correlation-id";
import { requestLogger } from "./middleware/request-logger";
import { rateLimiter } from "./middleware/rate-limit";
import { errorHandler } from "./middleware/error-handler";
import { watchlistsRouter } from "./routes/watchlists.routes";
import { eventsRouter } from "./routes/events.routes";
import { metricsRouter } from "./routes/metrics.routes";
import { logger } from "./config/logger";
import { metrics } from "./config/metrics";
import {
  createLoggedRedisClient,
  LoggedRedisClient,
} from "./middleware/redis-logger";
import {
  createLoggedPrismaClient,
  DatabaseMonitor,
} from "./middleware/db-logger";

const app = express();

// Initialize logged clients
const loggedRedis = new LoggedRedisClient(createLoggedRedisClient());
const loggedPrisma = createLoggedPrismaClient();
const dbMonitor = new DatabaseMonitor(loggedPrisma);

// Log application startup
logger.info("Starting Signal Watcher API", {
  nodeVersion: process.version,
  environment: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3001,
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(correlationId());
app.use(requestLogger());
app.use(rateLimiter);

// Basic root
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Signal Watcher API" });
});

// Health check endpoint with comprehensive checks
app.get("/health", async (req: Request, res: Response, _next: NextFunction) => {
  const startTime = Date.now();
  const checks: {
    redis: "ok" | "down" | "unknown";
    db: "ok" | "down" | "unknown";
  } = {
    redis: "unknown",
    db: "unknown",
  };

  // Redis check (optional if REDIS_URL provided)
  try {
    if (process.env.REDIS_URL) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 500);
      const pong = await loggedRedis.ping();
      clearTimeout(timeout);
      checks.redis = pong === "PONG" ? "ok" : "down";
    }
  } catch (error) {
    checks.redis = "down";
    req.logger?.warn("Redis health check failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  // DB check (optional if DATABASE_URL provided)
  try {
    if (process.env.DATABASE_URL) {
      await loggedPrisma.$queryRaw`SELECT 1`;
      checks.db = "ok";
    }
  } catch (error) {
    checks.db = "down";
    req.logger?.warn("Database health check failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  const duration = Date.now() - startTime;
  const overallStatus = Object.values(checks).every(
    (status) => status === "ok" || status === "unknown"
  )
    ? "ok"
    : "down";

  req.logger?.debug("Health check completed", {
    duration: `${duration}ms`,
    status: overallStatus,
    checks,
  });

  res.json({
    status: overallStatus,
    checks,
    timestamp: new Date().toISOString(),
    duration: `${duration}ms`,
  });
});

// API routes
app.use("/api/watchlists", watchlistsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/metrics", metricsRouter);

const port = Number(process.env.PORT) || 3001;

// Start server
const server = app.listen(port, () => {
  logger.info("API server started", {
    port,
    environment: process.env.NODE_ENV || "development",
    nodeVersion: process.version,
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

// Error handler should be last
// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.use(errorHandler);
