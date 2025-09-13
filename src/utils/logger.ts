/**
 * Simple structured logger wrapper (pino-like).
 *
 * Creates a pino logger instance with sane defaults.
 *
 * Usage:
 *   import logger, { info, error } from "@/utils/logger";
 *
 *   logger.info("Server started");
 *   info({ userId }, "User logged in");
 *   error(new Error("Something went wrong"));
 */

import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: { service: "evently" },
});

export default logger;

// Optional named shortcuts for convenience
export const { info, warn, error, debug } = logger;
