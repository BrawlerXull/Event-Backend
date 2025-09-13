/**
 * Queue initializer using BullMQ (v2+).
 *
 * Provides a shared Redis connection and helper to create queues.
 *
 * Example:
 *   import { createQueue, bookingQueue } from "@/queue";
 *
 *   // Add a job
 *   await bookingQueue.add("sendConfirmation", { bookingId: "123" });
 *
 * Use createQueue for additional queues as needed.
 */

import { Queue } from "bullmq";
import IORedis from "ioredis";
import config from "../config";

// Shared Redis connection for all queues
const connection = new IORedis(config.REDIS_URL);

/**
 * Create a new BullMQ queue.
 *
 * @param name - Name of the queue
 * @returns Object containing the queue and shared connection
 */
export function createQueue(name: string) {
  const queue = new Queue(name, { connection });
  return { queue, connection };
}

// Pre-created booking queue (example usage)
export const bookingQueue = createQueue("booking").queue;
