import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(
    ({ timestamp, level, message, correlationId, ...meta }) => {
      const logEntry: any = {
        timestamp,
        level,
        message,
        ...meta,
      };
      if (correlationId) {
        logEntry.correlationId = correlationId;
      }
      return JSON.stringify(logEntry);
    }
  )
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss.SSS" }),
  winston.format.printf(
    ({ timestamp, level, message, correlationId, ...meta }) => {
      const metaStr =
        Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
      const correlationStr = correlationId ? ` [${correlationId}]` : "";
      return `${timestamp} ${level}${correlationStr}: ${message}${metaStr}`;
    }
  )
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: {
    service: "signal-watcher-api",
    version: process.env.npm_package_version || "1.0.0",
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: process.env.NODE_ENV === "production" ? logFormat : consoleFormat,
    }),

    // File transport for all logs
    new DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      zippedArchive: true,
    }),

    // Error logs
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "20m",
      maxFiles: "30d",
      zippedArchive: true,
    }),

    // Access logs
    new DailyRotateFile({
      filename: "logs/access-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "http",
      maxSize: "20m",
      maxFiles: "7d",
      zippedArchive: true,
    }),
  ],
});

// Note: Winston v3 doesn't support addColors, colors are handled by format

// Create child logger with correlation ID
export const createChildLogger = (correlationId: string) => {
  return logger.child({ correlationId });
};

// Log levels for different types of events
export const logLevels = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  HTTP: "http",
  DEBUG: "debug",
} as const;

export type LogLevel = (typeof logLevels)[keyof typeof logLevels];
