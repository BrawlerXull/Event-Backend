/**
 * Health Routes
 *
 * Provides /health and /ready endpoints for monitoring.
 */

import { Router, Request, Response } from "express";
import { prisma } from "../utils/db";
import IORedis from "ioredis";
import config from "../config";

const router = Router();

// Optional Redis client for readiness check
const redis = new IORedis(config.REDIS_URL);

/**
 * GET /health
 * Basic liveness check
 */
router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
  });
});

/**
 * GET /ready
 * Readiness check: DB and Redis connectivity
 */
router.get("/ready", async (_req: Request, res: Response) => {
  const errors: Record<string, any> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    errors.db = err;
  }

  try {
    await redis.ping();
  } catch (err) {
    errors.redis = err;
  }

  if (Object.keys(errors).length) {
    res.status(503).json({ status: "not ready", errors });
  } else {
    res.status(200).json({ status: "ready" });
  }
});

export default router;
