import { Request, Response, NextFunction } from "express";
import { redis } from "../config/redis";

export function cache(ttlSeconds: number) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!process.env.REDIS_URL) return next();
      const key = `cache:${req.method}:${req.originalUrl}`;
      const cached = await redis.get(key);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).send(cached);
      }
      const send = res.send.bind(res);
      res.send = (body?: any): Response => {
        if (body) {
          // Store string body only; JSON.stringify if object
          const value = typeof body === "string" ? body : JSON.stringify(body);
          void redis.setex(key, ttlSeconds, value);
          res.setHeader("X-Cache", "MISS");
        }
        return send(body);
      };
      next();
    } catch (_e) {
      next();
    }
  };
}
