/**
 * Event Repository
 *
 * Provides Prisma-based CRUD operations for events.
 */

import { prisma } from "../utils/db";
import { ApiError } from "../utils/errors";

const EventRepo = {
  /**
   * Create a new event
   */
  async create(payload: any) {
    try {
      return await prisma.event.create({ data: payload });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * Find event by ID
   */
  async findById(id: string) {
    try {
      return await prisma.event.findUnique({ where: { id } });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * Find many events with optional filters and pagination
   */
  async findMany({
    page = 1,
    limit = 20,
    from,
    to,
    q,
  }: {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
    q?: string;
  }) {
    try {
      const where: any = {};

      if (from || to) {
        where.startTime = {};
        if (from) where.startTime.gte = new Date(from);
        if (to) where.startTime.lte = new Date(to);
      }

      if (q) {
        where.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { venue: { contains: q, mode: "insensitive" } },
        ];
      }

      const events = await prisma.event.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startTime: "asc" },
      });

      const total = await prisma.event.count({ where });

      return { events, total };
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * Update an event by ID
   * @param txClient - optional Prisma transaction client
   */
  async update(id: string, payload: any, txClient?: typeof prisma) {
    const client = txClient ?? prisma;
    try {
      return await client.event.update({ where: { id }, data: payload });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * Adjust available capacity atomically
   */
  async adjustAvailableCapacity(
    id: string,
    delta: number,
    txClient?: typeof prisma
  ) {
    const client = txClient ?? prisma;
    try {
      return await client.event.update({
        where: { id },
        data: { availableCapacity: { increment: delta } },
      });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * Delete an event by ID
   */
   async delete(id: string, txClient?: typeof prisma) {
    const client = txClient ?? prisma;
    try {
        return await client.event.delete({ where: { id } });
    } catch (err: any) {
        if (err.code === "P2025") return null; // Not found
        throw new ApiError(500, "DB_ERROR", err.message);
    }
   }

};

export default EventRepo;
