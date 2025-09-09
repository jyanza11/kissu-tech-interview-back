import { randomUUID } from "node:crypto";
import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

// Extend Request interface to include correlationId
declare global {
  namespace Express {
    interface Request {
      correlationId: string;
      startTime: number;
      logger: any;
    }
  }
}

export function correlationId() {
  return (req: Request, res: Response, next: NextFunction) => {
    const headerKey = "x-correlation-id";
    const id = (req.headers[headerKey] as string) || randomUUID();

    // Store correlation ID in request object
    req.correlationId = id;
    req.startTime = Date.now();

    // Set response header
    res.setHeader("X-Correlation-Id", id);

    // Create child logger with correlation ID
    req.logger = logger.child({ correlationId: id });

    next();
  };
}
