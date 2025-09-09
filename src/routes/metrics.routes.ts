import { Router, Request, Response } from "express";
import { metrics } from "../config/metrics";
import { logger } from "../config/logger";

export const metricsRouter: Router = Router();

// Get all metrics
metricsRouter.get("/", (req: Request, res: Response) => {
  try {
    const allMetrics = metrics.getAllMetrics();

    req.logger?.debug("Metrics requested", {
      metricCount: Object.keys(allMetrics).length,
    });

    res.json({
      success: true,
      data: allMetrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    req.logger?.error("Failed to get metrics", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Failed to retrieve metrics",
    });
  }
});

// Get metrics summary
metricsRouter.get("/summary", (req: Request, res: Response) => {
  try {
    const summary = metrics.getSummary();

    req.logger?.debug("Metrics summary requested", {
      totalMetrics: summary.totalMetrics,
    });

    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    req.logger?.error("Failed to get metrics summary", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Failed to retrieve metrics summary",
    });
  }
});

// Reset metrics (admin only)
metricsRouter.post("/reset", (req: Request, res: Response) => {
  try {
    // In production, you might want to add authentication here
    if (process.env.NODE_ENV === "production" && !req.headers.authorization) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    metrics.reset();

    req.logger?.info("Metrics reset requested", {
      resetBy: req.ip || "unknown",
    });

    res.json({
      success: true,
      message: "Metrics reset successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    req.logger?.error("Failed to reset metrics", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Failed to reset metrics",
    });
  }
});

// Health check with metrics
metricsRouter.get("/health", (req: Request, res: Response) => {
  try {
    const summary = metrics.getSummary();
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      metrics: {
        totalMetrics: summary.totalMetrics,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || "1.0.0",
      },
    };

    req.logger?.debug("Health check with metrics requested");

    res.json({
      success: true,
      data: healthStatus,
    });
  } catch (error) {
    req.logger?.error("Health check failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Health check failed",
    });
  }
});
