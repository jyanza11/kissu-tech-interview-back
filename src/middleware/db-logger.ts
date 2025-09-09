import { PrismaClient } from "@prisma/client";
import { logger } from "../config/logger";
import { metrics, metricNames } from "../config/metrics";

// Extend Prisma client with logging
export function createLoggedPrismaClient(): PrismaClient {
  const prisma = new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "event",
        level: "error",
      },
      {
        emit: "event",
        level: "info",
      },
      {
        emit: "event",
        level: "warn",
      },
    ],
  });

  // Log database queries
  prisma.$on("query", (e) => {
    const startTime = Date.now();
    const duration = e.duration;

    logger.debug("Database query executed", {
      query: e.query,
      params: e.params,
      duration: `${duration}ms`,
      target: e.target,
    });

    // Record metrics
    const operation = e.query?.split(" ")[0]?.toLowerCase() || "unknown";
    metrics.increment(metricNames.DB_QUERIES_TOTAL, 1, {
      operation,
    });

    metrics.timing(metricNames.DB_QUERY_DURATION, duration, {
      operation,
    });
  });

  // Log database errors
  prisma.$on("error", (e) => {
    logger.error("Database error occurred", {
      message: e.message,
      target: e.target,
    });

    metrics.increment("db_errors_total", 1, {
      target: e.target,
    });
  });

  // Log database info
  prisma.$on("info", (e) => {
    logger.info("Database info", {
      message: e.message,
      target: e.target,
    });
  });

  // Log database warnings
  prisma.$on("warn", (e) => {
    logger.warn("Database warning", {
      message: e.message,
      target: e.target,
    });
  });

  return prisma;
}

// Database connection monitoring
export class DatabaseMonitor {
  private prisma: PrismaClient;
  private isConnected: boolean = false;
  private lastHealthCheck: Date | null = null;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.startHealthMonitoring();
  }

  private async startHealthMonitoring() {
    // Initial health check
    await this.performHealthCheck();

    // Periodic health checks every 30 seconds
    setInterval(async () => {
      await this.performHealthCheck();
    }, 30000);
  }

  private async performHealthCheck() {
    try {
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const duration = Date.now() - startTime;

      this.isConnected = true;
      this.lastHealthCheck = new Date();

      logger.debug("Database health check passed", {
        duration: `${duration}ms`,
        timestamp: this.lastHealthCheck,
      });

      metrics.gauge(metricNames.DB_CONNECTIONS_ACTIVE, 1);
      metrics.timing("db_health_check_duration_ms", duration);
    } catch (error) {
      this.isConnected = false;
      this.lastHealthCheck = new Date();

      logger.error("Database health check failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: this.lastHealthCheck,
      });

      metrics.gauge(metricNames.DB_CONNECTIONS_ACTIVE, 0);
      metrics.increment("db_health_check_failures_total", 1);
    }
  }

  public getStatus() {
    return {
      isConnected: this.isConnected,
      lastHealthCheck: this.lastHealthCheck,
    };
  }
}
