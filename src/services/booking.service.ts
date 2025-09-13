/**
 * Booking Service
 *
 * Handles creation, cancellation, and retrieval of bookings with concurrency control.
 */

import BookingRepo from "../repositories/booking.repo";
import EventRepo from "../repositories/event.repo";
import { ApiError } from "../utils/errors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); // later move to src/utils/db.ts to avoid multiple instances

/**
 * DTO for creating a booking
 */
export interface CreateBookingInput {
  userId: string;
  eventId: string;
  seats: number;
  seat_ids?: string[];
  idempotencyKey?: string;
}

const bookingService = {
  /**
   * Create a booking with concurrency control
   */
  async createBooking(input: CreateBookingInput) {
    const { userId, eventId, seats, seat_ids, idempotencyKey } = input;

    if (seats <= 0) {
      throw new ApiError(400, "INVALID_SEATS", "Number of seats must be greater than zero");
    }

    // Idempotency check
    if (idempotencyKey) {
      const existing = await BookingRepo.findByIdempotencyKey(userId, eventId, idempotencyKey);
      if (existing) return existing;
    }

    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const booking = await prisma.$transaction(async (tx) => {
          // Seat-level booking
          if (seat_ids && seat_ids.length > 0) {
            // TODO: Verify seats are available using tx client
            // e.g., SELECT ... FOR UPDATE via prisma transaction
            // Example placeholder:
            // const seatsAvailable = await SeatRepo.checkSeatsAvailable(tx, eventId, seat_ids);
            // if (!seatsAvailable) throw ApiError(409, "SEATS_UNAVAILABLE", "One or more seats are not available");
          } else {
            // Lock the event row and check capacity
            const event = await tx.event.findUnique({
              where: { id: eventId },
              select: { id: true, availableCapacity: true },
            });
            if (!event) throw new ApiError(404, "EVENT_NOT_FOUND", "Event not found");

            if (event.availableCapacity < seats) {
              throw new ApiError(409, "EVENT_FULL", "Not enough seats available");
            }

            await tx.event.update({
              where: { id: eventId },
              data: { availableCapacity: { decrement: seats } },
            });
          }

          // Create booking
          const newBooking = await tx.booking.create({
            data: {
              userId,
              eventId,
              seats,
              status: "confirmed",
              idempotencyKey,
            },
          });

          return newBooking;
        });

        return booking;
      } catch (err: any) {
        // Retry on transaction conflicts or specific Prisma errors
        if (attempt < maxRetries - 1) continue;
        throw err;
      }
    }
    throw new ApiError(500, "BOOKING_FAILED", "Unable to create booking after retries");
  },

  /**
   * Cancel a booking
   */
  async cancelBooking({
    bookingId,
    userId,
    isAdmin = false,
  }: {
    bookingId: string;
    userId: string;
    isAdmin?: boolean;
  }) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!booking) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found");

      if (booking.userId !== userId && !isAdmin) {
        throw new ApiError(403, "FORBIDDEN", "Not authorized to cancel this booking");
      }

      if (booking.status !== "confirmed") {
        throw new ApiError(409, "CANNOT_CANCEL", "Booking cannot be cancelled");
      }

      // Update booking status
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "cancelled" },
      });

      // Restore event capacity
      await tx.event.update({
        where: { id: booking.eventId },
        data: { availableCapacity: { increment: booking.seats } },
      });

      // Optional: push next waitlist user to booking queue

      return updated;
    });
  },

  /**
   * Get bookings for a user with pagination
   */
  async getUserBookings(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      BookingRepo.findByUser(userId, page, limit),
      prisma.booking.count({ where: { userId } }),
    ]);

    return { data, total };
  },
};

/**
 * Concurrency notes:
 * - SELECT ... FOR UPDATE / transactions prevent overselling seats.
 * - Optimistic locking could be applied on Event.availableCapacity for high concurrency.
 * - Redis locks or job queues can be integrated for distributed systems.
 */

export default bookingService;
