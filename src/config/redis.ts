import Redis from "ioredis";

type MinimalRedis = {
  ping: () => Promise<string>;
  get: (key: string) => Promise<string | null>;
  setex: (key: string, ttlSeconds: number, value: string) => Promise<unknown>;
};

let redisInstance: MinimalRedis | null = null;

export const redis: MinimalRedis = (() => {
  if (redisInstance) return redisInstance;
  if (!process.env.REDIS_URL) {
    // Minimal no-op client for local dev without Redis
    redisInstance = {
      ping: async () => "PONG",
      get: async () => null,
      setex: async () => undefined,
    };
    return redisInstance;
  }
  const client = new Redis(process.env.REDIS_URL);
  // Cast to MinimalRedis to expose only used surface
  redisInstance = client as unknown as MinimalRedis;
  return redisInstance;
})();
