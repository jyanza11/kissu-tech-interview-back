import { config } from "dotenv";

// Load environment variables for testing
config({ path: ".env.test" });

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "error"; // Reduce log noise during tests
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://test:test@localhost:5432/signal_watcher_test";
process.env.REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379/1"; // Use different Redis DB for tests

// Global test timeout
jest.setTimeout(10000);
