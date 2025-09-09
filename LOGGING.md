# Logging and Observability

This document describes the logging and observability features implemented in the Signal Watcher API.

## Features

### 1. Structured Logging with Winston

- **Log Levels**: error, warn, info, http, debug
- **Formats**: JSON for files, colored console for development
- **Rotation**: Daily log rotation with compression
- **Files**:
  - `logs/application-YYYY-MM-DD.log` - All logs
  - `logs/error-YYYY-MM-DD.log` - Error logs only
  - `logs/access-YYYY-MM-DD.log` - HTTP access logs

### 2. Correlation ID Tracing

- **Automatic**: Each request gets a unique correlation ID
- **Headers**: `X-Correlation-Id` in requests and responses
- **Logging**: All logs include correlation ID for request tracing
- **Child Loggers**: Request-specific loggers with correlation ID

### 3. Request Performance Logging

- **Timing**: Request duration measurement
- **Details**: Method, URL, status code, response size
- **Metrics**: Automatic metrics collection for all requests
- **User Context**: IP address, User-Agent logging

### 4. Database Logging

- **Query Logging**: All Prisma queries logged with timing
- **Error Tracking**: Database errors with context
- **Health Monitoring**: Periodic database health checks
- **Metrics**: Query count, duration, and error tracking

### 5. Redis Logging

- **Connection Events**: Connect, ready, error, close, reconnecting
- **Operation Logging**: All Redis operations with timing
- **Cache Metrics**: Hit/miss ratios, operation counts
- **Health Monitoring**: Redis ping monitoring

### 6. Error Handling

- **Structured Errors**: Custom `ApiError` class
- **Context**: Full error context with request details
- **Logging**: Appropriate log levels based on error severity
- **Metrics**: Error count tracking by type and status

### 7. Metrics Collection

- **HTTP Metrics**: Request count, duration, response size
- **Database Metrics**: Query count, duration, connection status
- **Redis Metrics**: Operation count, duration, cache performance
- **Business Metrics**: Watchlist creation, event simulation, etc.

## API Endpoints

### Health Check
```
GET /health
```
Returns system health status with Redis and database checks.

### Metrics
```
GET /api/metrics
```
Returns all collected metrics.

```
GET /api/metrics/summary
```
Returns metrics summary with aggregated data.

```
GET /api/metrics/health
```
Returns health status with metrics overview.

```
POST /api/metrics/reset
```
Resets all metrics (admin only in production).

## Configuration

### Environment Variables

- `LOG_LEVEL`: Logging level (default: "info")
- `NODE_ENV`: Environment (affects log format and error details)
- `REDIS_URL`: Redis connection URL
- `DATABASE_URL`: Database connection URL

### Log Levels

- `error`: System errors, exceptions
- `warn`: Warning conditions, recoverable errors
- `info`: General information, application flow
- `http`: HTTP requests and responses
- `debug`: Detailed debugging information

## Usage Examples

### Using Request Logger
```typescript
// In route handlers
app.get("/api/example", (req: Request, res: Response) => {
  req.logger?.info("Processing request", { userId: "123" });
  // ... handler logic
});
```

### Using Metrics
```typescript
import { metrics, metricNames } from "./config/metrics.js";

// Increment counter
metrics.increment(metricNames.WATCHLISTS_CREATED, 1);

// Record timing
metrics.timing(metricNames.DB_QUERY_DURATION, 150);

// Record gauge
metrics.gauge(metricNames.DB_CONNECTIONS_ACTIVE, 5);
```

### Custom Errors
```typescript
import { ApiError } from "./middleware/error-handler.js";

throw new ApiError("Resource not found", 404, "NOT_FOUND");
```

## Log Format

### JSON Log Entry
```json
{
  "timestamp": "2024-01-15 10:30:45.123",
  "level": "info",
  "message": "Request completed",
  "correlationId": "abc-123-def",
  "method": "GET",
  "url": "/api/watchlists",
  "statusCode": 200,
  "duration": "45ms",
  "service": "signal-watcher-api",
  "version": "1.0.0"
}
```

### Console Log Entry (Development)
```
10:30:45.123 info [abc-123-def]: Request completed {"method":"GET","url":"/api/watchlists","statusCode":200,"duration":"45ms"}
```

## Monitoring

### Key Metrics to Monitor

1. **Response Times**: Average, P95, P99 request durations
2. **Error Rates**: 4xx and 5xx error percentages
3. **Database Performance**: Query duration and connection health
4. **Redis Performance**: Cache hit rates and operation latency
5. **System Health**: Memory usage, uptime, active connections

### Alerting Recommendations

- Response time > 1 second
- Error rate > 5%
- Database connection failures
- Redis connection failures
- High memory usage (> 80%)

## Troubleshooting

### Common Issues

1. **Log Files Not Created**: Check directory permissions for `logs/` folder
2. **High Log Volume**: Adjust log levels or implement log filtering
3. **Metrics Memory Usage**: Reset metrics periodically in production
4. **Correlation ID Missing**: Ensure correlation middleware is first

### Debug Mode

Set `LOG_LEVEL=debug` to enable detailed logging for troubleshooting.
