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

const seatService = {
  /**
   * List seats for an event with optional filters
   * @param eventId - Event ID
   * @param filters - e.g., section, row, status
   */
  async listSeats(eventId: string, filters?: any) {
    const seats = await SeatRepo.list(eventId, filters);
    return seats;
  },

  /**
   * Hold specific seats for a user
   * @param params.eventId - Event ID
   * @param params.seatIds - Array of seat IDs to hold
   * @param params.userId - User ID
   * @param params.holdSeconds - Hold duration in seconds (default 120)
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

    // Transaction ensures atomic check-and-hold
    const holdResult = await prisma.$transaction(async (tx) => {
      const seats = await tx.seat.findMany({
        where: { id: { in: seatIds }, eventId, status: "available" },
        lock: { mode: "Update" }, // ensures no concurrent holds
      });

      if (seats.length !== seatIds.length) {
        throw new ApiError(409, "SEATS_UNAVAILABLE", "Some seats are not available");
      }

      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: "held", heldBy: userId, heldUntil },
      });

      return { seat_ids: seatIds, heldUntil };
    });

    return holdResult;
  },

  /**
   * Confirm held seats to finalize booking
   * @param params.eventId - Event ID
   * @param params.seatIds - Array of seat IDs to confirm
   * @param params.userId - User ID
   * @param params.holdToken - Optional hold token if used instead of seatIds
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

    // Transaction ensures atomic booking
    const booking = await prisma.$transaction(async (tx) => {
      const seats = await tx.seat.findMany({
        where: { id: { in: seatIds }, eventId, status: "held", heldBy: userId },
        lock: { mode: "Update" },
      });

      if (seats.length !== seatIds.length) {
        throw new ApiError(409, "SEATS_NOT_HELD", "Some seats are not held by this user");
      }

      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: "booked", heldBy: null, heldUntil: null },
      });

      // Create booking record using the correct DTO
      const bookingRecord = await bookingService.createBooking({
        userId,
        eventId,
        seats: seatIds.length,
        seat_ids: seatIds, // matches CreateBookingInput
      } as CreateBookingInput);

      return bookingRecord;
    });

    return booking;
  },
};

export default seatService;
