/**
 * Booking Repository
 *
 * Provides Prisma-based CRUD operations for bookings.
 */

import { prisma } from "../utils/db";
import { ApiError } from "../utils/errors";

const BookingRepo = {
  /**
   * Create a new booking
   * @param payload - booking data
   * @param txClient - optional Prisma transaction client
   */
  async create(payload: any, txClient?: typeof prisma) {
    const client = txClient ?? prisma;
    try {
      return await client.booking.create({ data: payload });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * Find booking by ID
   */
  async findById(id: string) {
    try {
      return await prisma.booking.findUnique({ where: { id } });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * Find booking by idempotency key
   */
  async findByIdempotencyKey(userId: string, eventId: string, key: string) {
    try {
      return await prisma.booking.findFirst({
        where: { userId, eventId, idempotencyKey: key },
      });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * Update booking status
   * @param txClient - optional Prisma transaction client
   */
  async updateStatus(id: string, status: string, txClient?: typeof prisma) {
    const client = txClient ?? prisma;
    try {
      return await client.booking.update({ where: { id }, data: { status } });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * Find bookings by user with pagination
   */
  async findByUser(userId: string, page = 1, limit = 20) {
    try {
      const bookings = await prisma.booking.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      });

      const total = await prisma.booking.count({ where: { userId } });

      return { bookings, total };
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },
};

export default BookingRepo;
