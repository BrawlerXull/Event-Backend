/**
 * Seat Service
 *
 * Handles seat-level operations: listing, holding, and confirming seats.
 *
 * ⚠️ Automatic hold expiry should be handled by a background job (e.g., cron or queue)
 * that releases seats after holdSeconds.
 */

import SeatRepo from "../repositories/seat.repo";
import { prisma } from "../utils/db";
import { ApiError } from "../utils/errors";
import bookingService, { CreateBookingInput } from "./booking.service";

type HoldSeatsResult = {
  seat_ids: string[];
  heldUntil: Date;
};

const seatService = {
  /**
   * List seats for an event with optional filters
   */
  async listSeats(eventId: string, filters?: any) {
    const seats = await SeatRepo.list(eventId, filters);
    return seats;
  },

  /**
   * Hold specific seats for a user
   */
  async holdSeats({
    eventId,
    seatIds,
    userId,
    holdSeconds = 120,
  }: {
    eventId: string;
    seatIds: string[];
    userId: string;
    holdSeconds?: number;
  }) {
    if (!seatIds.length) {
      throw new ApiError(400, "INVALID_INPUT", "seatIds cannot be empty");
    }

    const now = new Date();
    const heldUntil = new Date(now.getTime() + holdSeconds * 1000);

    const holdResult: HoldSeatsResult = await prisma.$transaction(async (tx) => {
      // Attempt to hold seats atomically
      const updated = await tx.seat.updateMany({
        where: { id: { in: seatIds }, eventId, status: "available" },
        data: { status: "held", heldBy: userId, heldUntil },
      });

      if (updated.count !== seatIds.length) {
        throw new ApiError(409, "SEATS_UNAVAILABLE", "Some seats are not available");
      }

      return { seat_ids: seatIds, heldUntil };
    });

    return holdResult;
  },

  /**
   * Confirm held seats to finalize booking
   */
  async confirmSeats({
    eventId,
    seatIds,
    userId,
    holdToken,
  }: {
    eventId: string;
    seatIds?: string[];
    userId: string;
    holdToken?: string;
  }) {
    if (!seatIds?.length) {
      throw new ApiError(400, "INVALID_INPUT", "seatIds required for confirmation");
    }

    const booking = await prisma.$transaction(async (tx) => {
      // Atomically mark held seats as booked
      const updated = await tx.seat.updateMany({
        where: { id: { in: seatIds }, eventId, status: "held", heldBy: userId },
        data: { status: "booked", heldBy: null, heldUntil: null },
      });

      if (updated.count !== seatIds.length) {
        throw new ApiError(409, "SEATS_NOT_HELD", "Some seats are not held by this user");
      }

      // Create booking record
      const bookingRecord = await bookingService.createBooking({
        userId,
        eventId,
        seats: seatIds.length,
        seat_ids: seatIds,
      } as CreateBookingInput);

      return bookingRecord;
    });

    return booking;
  },
};

export default seatService;
