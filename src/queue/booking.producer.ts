/**
 * Booking job producer.
 *
 * Provides a helper to enqueue booking jobs into the booking queue.
 *
 * Example usage:
 *   await enqueueBookingJob(
 *     { userId, eventId, seats, idempotencyKey },
 *     { attempts: 3, backoff: { type: "exponential", delay: 500 } }
 *   );
 */

import { bookingQueue } from "./index";
import { JobsOptions } from "bullmq";
import logger from "../utils/logger";

/**
 * Enqueue a new booking job.
 *
 * @param jobData - Payload for the booking job (e.g., userId, eventId, seats, idempotencyKey).
 * @param opts - Optional BullMQ JobOptions (e.g., retries, backoff).
 * @returns The ID of the added job.
 */
export async function enqueueBookingJob(
  jobData: any,
  opts?: JobsOptions
): Promise<string> {
  const job = await bookingQueue.add("processBooking", jobData, opts);
  logger.info(`Enqueued booking job ${job.id} for user ${jobData.userId}`);
  return job.id!;
}

export default enqueueBookingJob;
