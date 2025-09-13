/**
 * Waitlist Repository
 *
 * Provides CRUD operations for the waitlist table.
 *
 * ⚠️ Use transactions in popNext to avoid race conditions when promoting users.
 */

import { prisma } from "../utils/db";
import { ApiError } from "../utils/errors";

const WaitlistRepo = {
  /**
   * Add a user to the waitlist
   */
  async create({ eventId, userId }: { eventId: string; userId: string }) {
    try {
      return await prisma.waitlist.create({
        data: { eventId, userId, joinedAt: new Date() },
      });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * Remove a user from the waitlist
   */
  async delete(eventId: string, userId: string) {
    try {
      return await prisma.waitlist.deleteMany({ where: { eventId, userId } });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * Find a specific waitlist entry
   */
  async find(eventId: string, userId: string) {
    try {
      return await prisma.waitlist.findFirst({ where: { eventId, userId } });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * List waitlist for an event with pagination
   */
  async list(eventId: string, offset = 0, limit = 20) {
    try {
      return await prisma.waitlist.findMany({
        where: { eventId },
        orderBy: { joinedAt: "asc" },
        skip: offset,
        take: limit,
      });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * Pop the next user from waitlist atomically for promotion
   */
  async popNext(eventId: string) {
    try {
      return await prisma.$transaction(async (tx) => {
        const next = await tx.waitlist.findFirst({
          where: { eventId },
          orderBy: { joinedAt: "asc" },
        });

        if (!next) return null;

        await tx.waitlist.delete({ where: { id: next.id } });
        return next;
      });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },
};

export default WaitlistRepo;
