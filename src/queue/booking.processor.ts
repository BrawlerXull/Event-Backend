/**
 * Booking job processor worker with Redis distributed lock.
 *
 * Responsible for consuming jobs from the "booking" queue and delegating
 * to the bookingService while preventing concurrent bookings for the same event.
 *
 * Recommended to run this in a separate worker process for scalability and isolation.
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
import { redlock } from "../utils/redisLock"; // Redlock instance for distributed locks

/**
 * Creates a booking worker that consumes jobs from the "booking" queue.
 */
export function createBookingWorker() {
  const worker = new Worker(
    "booking", // Queue name
    async (job) => {
      logger.info({ jobId: job.id }, "Processing booking job");

      const data = job.data as CreateBookingInput;

      // ✅ Use a distributed lock to prevent overselling seats for the same event
      // Lock key format: lock:event:{eventId}
      // This ensures only one worker can process bookings for the same event at a time
      const lockKey = `lock:event:${data.eventId}`;
      let lock;

      try {
        // Acquire lock with a TTL of 3000ms (adjust as needed)
        lock = await redlock.acquire([lockKey], 3000);

        // Critical section: safe to create booking
        const booking = await bookingService.createBooking(data);

        logger.info({ jobId: job.id, bookingId: booking.id }, "Booking successful");
        return booking;
      } catch (err) {
        // Log errors and rethrow to let BullMQ mark the job as failed
        logger.error({ jobId: job.id, err }, "Booking job failed");
        throw err;
      } finally {
        // Release the lock if it was acquired
        if (lock) {
          try {
            await lock.unlock();
          } catch (releaseErr) {
            // Log any errors during lock release but do not block processing
            logger.error({ jobId: job.id, releaseErr }, "Failed to release lock");
          }
        }
      }
    },
    {
      // Redis connection for BullMQ
      connection: new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null }),
    }
  );

  /**
   * Event listeners for worker lifecycle
   */
  worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Booking job completed");
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err }, "Booking job failed");
  });

  return worker;
}
