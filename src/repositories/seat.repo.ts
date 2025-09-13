/**
 * Seat Repository
 *
 * Provides Prisma-based data access for seat entities.
 */

import { prisma } from "../utils/db";
import { ApiError } from "../utils/errors";

const SeatRepo = {
  /**
   * List seats for an event with optional filters
   * @param eventId - Event ID
   * @param filters - e.g., status, section, pagination
   */
  async list(eventId: string, filters?: any) {
    try {
      const where: any = { eventId };

      if (filters?.status) where.status = filters.status;
      if (filters?.section) where.section = filters.section;

      const seats = await prisma.seat.findMany({
        where,
        skip: filters?.offset,
        take: filters?.limit,
        orderBy: { label: "asc" },
      });

      return seats;
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * Find seat by ID
   */
  async findById(id: string) {
    try {
      return await prisma.seat.findUnique({ where: { id } });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * Find seat by event and label (e.g., "A1")
   */
  async findByEventAndLabel(eventId: string, label: string) {
    try {
      return await prisma.seat.findFirst({ where: { eventId, label } });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * Update status of a single seat
   * @param txClient - optional Prisma transaction client
   */
  async updateStatus(id: string, status: string, txClient?: typeof prisma) {
    const client = txClient ?? prisma;
    try {
      return await client.seat.update({ where: { id }, data: { status } });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * Bulk update seat statuses
   * @param txClient - optional Prisma transaction client
   */
  async bulkUpdateStatus(ids: string[], status: string, txClient?: typeof prisma) {
    const client = txClient ?? prisma;
    try {
      return await client.seat.updateMany({ where: { id: { in: ids } }, data: { status } });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },
};

export default SeatRepo;
