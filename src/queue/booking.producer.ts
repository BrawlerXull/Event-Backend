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

export async function enqueueBookingJob(
  jobData: any,
  opts?: JobsOptions
): Promise<string> {
  const defaultOpts: JobsOptions = {
    attempts: 3,
    backoff: { type: "exponential", delay: 500 },
    removeOnComplete: false,
    removeOnFail: false,
  };

  const jobOptions = opts ? { ...defaultOpts, ...opts } : defaultOpts;

  const job = await bookingQueue.add("processBooking", jobData, jobOptions);

  logger.info(`Enqueued booking job ${job.id} for user ${jobData.userId}`);
  return job.id!;
}

export default enqueueBookingJob;
