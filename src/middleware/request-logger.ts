import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";
import { metrics, metricNames } from "../config/metrics";

export function requestLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = req.startTime || Date.now();

    // Log request start
    req.logger?.http("Request started", {
      method: req.method,
      url: req.url,
      userAgent: req.get("User-Agent"),
      ip: req.ip || req.connection.remoteAddress,
      contentLength: req.get("Content-Length"),
    });

    // Override res.end to log response
    const originalEnd = res.end.bind(res);
    res.end = function (chunk?: any, encoding?: any): any {
      const duration = Date.now() - startTime;
      const contentLength =
        res.get("Content-Length") || (chunk ? chunk.length : 0);

      // Log response
      req.logger?.http("Request completed", {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentLength,
        responseTime: duration,
      });

      // Record metrics
      metrics.increment(metricNames.HTTP_REQUESTS_TOTAL, 1, {
        method: req.method,
        status: res.statusCode.toString(),
        route: req.route?.path || req.path,
      });

      metrics.timing(metricNames.HTTP_REQUEST_DURATION, duration, {
        method: req.method,
        route: req.route?.path || req.path,
      });

      metrics.gauge(metricNames.HTTP_RESPONSE_SIZE, contentLength, {
        method: req.method,
        route: req.route?.path || req.path,
      });

      // Call original end
      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}
