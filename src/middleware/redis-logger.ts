import Redis from "ioredis";
import { logger } from "../config/logger";
import { metrics, metricNames } from "../config/metrics";

// Extend Redis client with logging
export function createLoggedRedisClient(url?: string): Redis {
  const redis = new Redis(
    url || process.env.REDIS_URL || "redis://localhost:6379"
  );

  // Log Redis connection events
  redis.on("connect", () => {
    logger.info("Redis connected", {
      host: redis.options.host,
      port: redis.options.port,
    });
  });

  redis.on("ready", () => {
    logger.info("Redis ready", {
      host: redis.options.host,
      port: redis.options.port,
    });
  });

  redis.on("error", (error) => {
    logger.error("Redis error", {
      error: error.message,
      host: redis.options.host,
      port: redis.options.port,
    });

    metrics.increment("redis_errors_total", 1, {
      error: error.name,
    });
  });

  redis.on("close", () => {
    logger.warn("Redis connection closed", {
      host: redis.options.host,
      port: redis.options.port,
    });
  });

  redis.on("reconnecting", () => {
    logger.info("Redis reconnecting", {
      host: redis.options.host,
      port: redis.options.port,
    });
  });

  return redis;
}

// Redis operation wrapper with logging
export class LoggedRedisClient {
  private redis: Redis;
  private logger = logger.child({ component: "redis" });

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async get(key: string): Promise<string | null> {
    const startTime = Date.now();

    try {
      const result = await this.redis.get(key);
      const duration = Date.now() - startTime;

      this.logger.debug("Redis GET operation", {
        key,
        duration: `${duration}ms`,
        hit: result !== null,
      });

      // Record metrics
      metrics.increment(metricNames.REDIS_OPERATIONS_TOTAL, 1, {
        operation: "get",
      });

      metrics.timing(metricNames.REDIS_OPERATION_DURATION, duration, {
        operation: "get",
      });

      if (result !== null) {
        metrics.increment(metricNames.REDIS_CACHE_HITS, 1);
      } else {
        metrics.increment(metricNames.REDIS_CACHE_MISSES, 1);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error("Redis GET operation failed", {
        key,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      metrics.increment("redis_operation_errors_total", 1, {
        operation: "get",
      });

      throw error;
    }
  }

  async setex(key: string, seconds: number, value: string): Promise<"OK"> {
    const startTime = Date.now();

    try {
      const result = await this.redis.setex(key, seconds, value);
      const duration = Date.now() - startTime;

      this.logger.debug("Redis SETEX operation", {
        key,
        seconds,
        duration: `${duration}ms`,
      });

      // Record metrics
      metrics.increment(metricNames.REDIS_OPERATIONS_TOTAL, 1, {
        operation: "setex",
      });

      metrics.timing(metricNames.REDIS_OPERATION_DURATION, duration, {
        operation: "setex",
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error("Redis SETEX operation failed", {
        key,
        seconds,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      metrics.increment("redis_operation_errors_total", 1, {
        operation: "setex",
      });

      throw error;
    }
  }

  async ping(): Promise<string> {
    const startTime = Date.now();

    try {
      const result = await this.redis.ping();
      const duration = Date.now() - startTime;

      this.logger.debug("Redis PING operation", {
        duration: `${duration}ms`,
        result,
      });

      metrics.timing("redis_ping_duration_ms", duration);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error("Redis PING operation failed", {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      metrics.increment("redis_ping_failures_total", 1);

      throw error;
    }
  }

  async del(key: string): Promise<number> {
    const startTime = Date.now();

    try {
      const result = await this.redis.del(key);
      const duration = Date.now() - startTime;

      this.logger.debug("Redis DEL operation", {
        key,
        duration: `${duration}ms`,
        deleted: result,
      });

      metrics.increment(metricNames.REDIS_OPERATIONS_TOTAL, 1, {
        operation: "del",
      });

      metrics.timing(metricNames.REDIS_OPERATION_DURATION, duration, {
        operation: "del",
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error("Redis DEL operation failed", {
        key,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      metrics.increment("redis_operation_errors_total", 1, {
        operation: "del",
      });

      throw error;
    }
  }

  // Proxy other methods
  get client(): Redis {
    return this.redis;
  }
}
