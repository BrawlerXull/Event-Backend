/**
 * Waitlist Service
 *
 * Handles waitlist operations, including join, leave, and auto-promotion
 * when seats become available.
 *
 * ⚠️ Race conditions: when promoting users from waitlist, wrap in DB transaction
 * to ensure correct order and prevent overbooking.
 */

import WaitlistRepo from "../repositories/waitlist.repo";
import enqueueBookingJob from "../queue/booking.producer";
import { ApiError } from "../utils/errors";

const waitlistService = {
  /**
   * Add a user to the waitlist for an event
   * @param eventId - Event ID
   * @param userId - User ID
   */
  async join(eventId: string, userId: string) {
    const existing = await WaitlistRepo.find(eventId, userId);
    if (existing) {
      throw new ApiError(400, "ALREADY_WAITLISTED", "User is already on the waitlist");
    }

    const record = await WaitlistRepo.create({ eventId, userId });
    return record;
  },

  /**
   * Remove a user from the waitlist
   * @param eventId - Event ID
   * @param userId - User ID
   */
  async leave(eventId: string, userId: string) {
    const removed = await WaitlistRepo.delete(eventId, userId);
    return removed;
  },

  /**
   * Pop next user from the waitlist (e.g., after a cancellation)
   * @param eventId - Event ID
   * @returns User ID of promoted user
   */
  async popNext(eventId: string) {
    const nextUser = await WaitlistRepo.popNext(eventId); // atomic, ordered by joinedAt
    if (nextUser) {
      // enqueue booking notification or auto-book
      await enqueueBookingJob({ eventId, userId: nextUser.userId });
      return nextUser;
    }
    return null;
  },

  /**
   * Get waitlist for an event with pagination
   * @param eventId - Event ID
   * @param page - Page number
   * @param limit - Items per page
   */
  async getWaitlist(eventId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const list = await WaitlistRepo.list(eventId, offset, limit);
    return list;
  },
};

export default waitlistService;
