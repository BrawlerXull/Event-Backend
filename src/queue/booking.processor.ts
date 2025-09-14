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
import bookingService, { CreateBookingInput } from "../services/booking.service";
import logger from "../utils/logger";


/**
 * Enqueue a new booking job.
 *
 * @param jobData - Payload for the booking job (e.g., userId, eventId, seats, idempotencyKey).
 * @param opts - Optional BullMQ JobOptions (e.g., retries, backoff).
 * @returns The ID of the added job.
 */
export function createBookingWorker() {
  const worker = new Worker(
    "booking",
    async (job) => {
      logger.info({ jobId: job.id }, "Processing booking job");

      const data = job.data as CreateBookingInput;

      try {
        const booking = await bookingService.createBooking(data);
        logger.info({ jobId: job.id, bookingId: booking.id }, "Booking successful");
        return booking;
      } catch (err) {
        logger.error({ jobId: job.id, err }, "Booking job failed");
        throw err; // BullMQ will mark as failed
      }
    },
    {
      connection: new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null }),
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
