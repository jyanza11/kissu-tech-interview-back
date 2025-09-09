import { logger } from "./logger";

// Simple in-memory metrics store
interface MetricData {
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  lastUpdated: Date;
}

interface MetricsStore {
  [key: string]: MetricData;
}

class MetricsCollector {
  private metrics: MetricsStore = {};
  private readonly logger = logger.child({ component: "metrics" });

  // Increment a counter
  increment(
    name: string,
    value: number = 1,
    labels: Record<string, string> = {}
  ) {
    const key = this.getMetricKey(name, labels);
    if (!this.metrics[key]) {
      this.metrics[key] = {
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
        avg: 0,
        lastUpdated: new Date(),
      };
    }

    this.metrics[key].count += value;
    this.metrics[key].sum += value;
    this.metrics[key].min = Math.min(this.metrics[key].min, value);
    this.metrics[key].max = Math.max(this.metrics[key].max, value);
    this.metrics[key].avg = this.metrics[key].sum / this.metrics[key].count;
    this.metrics[key].lastUpdated = new Date();

    this.logger.debug("Metric incremented", {
      metric: name,
      value,
      labels,
      current: this.metrics[key],
    });
  }

  // Record a timing measurement
  timing(name: string, duration: number, labels: Record<string, string> = {}) {
    this.increment(`${name}_duration_ms`, duration, labels);
    this.increment(`${name}_count`, 1, labels);
  }

  // Record a gauge value
  gauge(name: string, value: number, labels: Record<string, string> = {}) {
    const key = this.getMetricKey(name, labels);
    this.metrics[key] = {
      count: 1,
      sum: value,
      min: value,
      max: value,
      avg: value,
      lastUpdated: new Date(),
    };

    this.logger.debug("Gauge recorded", {
      metric: name,
      value,
      labels,
    });
  }

  // Get all metrics
  getAllMetrics(): Record<string, MetricData> {
    return { ...this.metrics };
  }

  // Get specific metric
  getMetric(
    name: string,
    labels: Record<string, string> = {}
  ): MetricData | undefined {
    const key = this.getMetricKey(name, labels);
    return this.metrics[key];
  }

  // Reset all metrics
  reset() {
    this.metrics = {};
    this.logger.info("All metrics reset");
  }

  // Get metrics summary for health check
  getSummary() {
    const summary = {
      totalMetrics: Object.keys(this.metrics).length,
      metrics: Object.entries(this.metrics).reduce((acc, [key, data]) => {
        acc[key] = {
          count: data.count,
          avg: Math.round(data.avg * 100) / 100,
          min: data.min === Infinity ? 0 : data.min,
          max: data.max === -Infinity ? 0 : data.max,
          lastUpdated: data.lastUpdated,
        };
        return acc;
      }, {} as Record<string, any>),
    };

    return summary;
  }

  private getMetricKey(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join(",");

    return labelStr ? `${name}{${labelStr}}` : name;
  }
}

// Singleton instance
export const metrics = new MetricsCollector();

// Common metric names
export const metricNames = {
  // HTTP metrics
  HTTP_REQUESTS_TOTAL: "http_requests_total",
  HTTP_REQUEST_DURATION: "http_request_duration_ms",
  HTTP_RESPONSE_SIZE: "http_response_size_bytes",

  // Database metrics
  DB_QUERIES_TOTAL: "db_queries_total",
  DB_QUERY_DURATION: "db_query_duration_ms",
  DB_CONNECTIONS_ACTIVE: "db_connections_active",

  // Redis metrics
  REDIS_OPERATIONS_TOTAL: "redis_operations_total",
  REDIS_OPERATION_DURATION: "redis_operation_duration_ms",
  REDIS_CACHE_HITS: "redis_cache_hits_total",
  REDIS_CACHE_MISSES: "redis_cache_misses_total",

  // AI service metrics
  AI_REQUESTS_TOTAL: "ai_requests_total",
  AI_REQUEST_DURATION: "ai_request_duration_ms",
  AI_TOKENS_USED: "ai_tokens_used_total",

  // Business metrics
  WATCHLISTS_CREATED: "watchlists_created_total",
  EVENTS_SIMULATED: "events_simulated_total",
  TERMS_ADDED: "terms_added_total",
} as const;
