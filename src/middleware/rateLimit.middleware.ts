/**
 * Simple Redis-backed rate limiting middleware.
 *
 * Example usage:
 *   import rateLimit from "@/middleware/rateLimit.middleware";
 *   app.post("/bookings", rateLimit({ windowSeconds: 60, max: 10 }), bookingController.create);
 *
 * This ensures a user/IP can only attempt 10 booking requests per minute.
 *
 * ⚠️ In production: use a pooled/clustered Redis client for resilience and performance.
 */

import { Request, Response, NextFunction } from "express";
import IORedis from "ioredis";
import config from "../config";
import { ApiError } from "../utils/errors";

const redis = new IORedis(config.REDIS_URL);

interface RateLimitOptions {
  windowSeconds?: number;
  max?: number;
}

export function rateLimit({ windowSeconds = 60, max = 30 }: RateLimitOptions = {}) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Use user ID if available, otherwise fallback to IP
      const identifier = req.user?.id ?? req.ip;
      const key = `rate:${identifier}:${req.path}`;

      const count = await redis.incr(key);

      if (count === 1) {
        // First hit -> set expiry window
        await redis.expire(key, windowSeconds);
      }

      if (count > max) {
        return next(
          new ApiError(
            429,
            "RATE_LIMIT_EXCEEDED",
            "Too many requests, please try again later."
          )
        );
      }

      return next();
    } catch (err: any) {
      // On Redis failure, do NOT block the request (fail-open strategy)
      console.error("Rate limiter error:", err);
      return next();
    }
  };
}
