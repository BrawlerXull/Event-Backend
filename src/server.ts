/**
 * Server Entry Point
 *
 * Starts Express server and initializes background workers.
 */

import app from "./app";
import config from "./config";
import logger from "./utils/logger";
import { createBookingWorker } from "./queue/booking.processor";
import { bookingQueue } from "./queue/index";
import { prisma } from "./utils/db";

const port = config.PORT || 4000;

const server = app.listen(port, () => {
  logger.info(`Server started on port ${port}`);
  // Start background booking worker
  createBookingWorker();
});

/**
 * Graceful shutdown
 */
const shutdown = async () => {
  logger.info("Shutting down server...");
  server.close(async (err) => {
    if (err) {
      logger.error(err, "Error closing server");
      process.exit(1);
    }
    try {
      await prisma.$disconnect();
      logger.info("Prisma disconnected");
      // Close Redis / BullMQ connections if needed
      await bookingQueue.close();
    } catch (e) {
      logger.error(e, "Error during shutdown");
    }
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

/**
 * Catch unhandled promise rejections
 */
process.on("unhandledRejection", (reason) => {
  logger.error(reason, "Unhandled Rejection");
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error(err, "Uncaught Exception");
  process.exit(1);
});
