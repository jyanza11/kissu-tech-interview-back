import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";
import { metrics, metricNames } from "../config/metrics";

// Custom error class
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = err.message || "Internal Server Error";
  const correlationId = req.correlationId || res.getHeader("X-Correlation-Id");
  const isOperational = err.isOperational !== false;

  // Create error context
  const errorContext = {
    correlationId,
    method: req.method,
    url: req.url,
    userAgent: req.get("User-Agent"),
    ip: req.ip || req.connection.remoteAddress,
    statusCode: status,
    errorCode: code,
    message,
    stack: err.stack,
    isOperational,
    timestamp: new Date().toISOString(),
  };

  // Log error with appropriate level
  if (status >= 500) {
    req.logger?.error("Server error occurred", errorContext);
  } else if (status >= 400) {
    req.logger?.warn("Client error occurred", errorContext);
  } else {
    req.logger?.info("Error occurred", errorContext);
  }

  // Record error metrics
  metrics.increment("errors_total", 1, {
    status: status.toString(),
    code,
    isOperational: isOperational.toString(),
  });

  // Prepare response
  const response: any = {
    code,
    message,
    correlationId,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
    response.details = errorContext;
  }

  res.status(status).json(response);
}
