import IORedis from "ioredis";
import Redlock from "redlock";
import config from "../config";

// Shared Redis connection
export const redisClient = new IORedis(config.REDIS_URL);

// Redlock instance
export const redlock = new Redlock(
  [redisClient.duplicate() as any], // ← cast to any to satisfy TypeScript
  {
    driftFactor: 0.01,
    retryCount: 5,
    retryDelay: 200,
  }
);
