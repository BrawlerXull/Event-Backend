/**
 * Booking job processor worker.
 *
 * Responsible for consuming jobs from the "booking" queue and delegating
 * to the bookingService. Recommended to run this in a separate worker
 * process for scalability and isolation.
 *
 * Example usage (server.ts or worker.ts):
 *   import { createBookingWorker } from "./queue/booking.processor";
 *   createBookingWorker();
 */

import { Worker } from "bullmq";
import IORedis from "ioredis";
import config from "../config";
import bookingService from "../services/booking.service";
import logger from "../utils/logger";

/**
 * Create and start a booking worker.
 * @returns Worker instance bound to the "booking" queue
 */
export function createBookingWorker(): Worker {
  const worker = new Worker(
    "booking",
    async (job) => {
      logger.info({ jobId: job.id }, "Processing booking job");

      try {
        const data = job.data;
        await bookingService.createBooking(data);
      } catch (err) {
        logger.error({ jobId: job.id, err }, "Booking job failed inside processor");
        throw err; // Let BullMQ mark as failed
      }
    },
    {
      connection: new IORedis(config.REDIS_URL,{
        maxRetriesPerRequest: null, 
      }),
    }
  );

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Booking job completed");
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err }, "Booking job failed");
  });

  return worker;
}
