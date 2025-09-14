/**
 * Booking Controller
 *
 * Handles creating bookings via queue and cancelling bookings directly.
 */

import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { enqueueBookingJob } from "../queue/booking.producer";
import { ApiError } from "../utils/errors";
import bookingService from "../services/booking.service";

const bookingController = {
  /**
   * Create a booking (enqueue job)
   * @route POST /api/events/:eventId/book
   * @header Idempotency-Key optional
   * @body { seats: number, seat_ids?: string[], payment_method?: string }
   */
  async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const BodySchema = z.object({
        seats: z.number().int().positive(),
        seat_ids: z.array(z.string()).optional(),
        payment_method: z.string().optional(),
      });

      const parsed = BodySchema.parse(req.body);
      const eventId = req.params.eventId;
      if (!eventId) throw new ApiError(400, "MISSING_PARAM", "eventId is required");

      const userId = req.user?.id;
      if (!userId) throw new ApiError(401, "UNAUTHORIZED", "User not authenticated");

      const idempotencyKey = req.header("Idempotency-Key");

      // ✅ Push job to Redis queue instead of calling service directly
      const jobId = await enqueueBookingJob({
        userId,
        eventId,
        seats: parsed.seats,
        seat_ids: parsed.seat_ids,
        idempotencyKey,
      });

      res.status(202).json({
        message: "Booking request queued",
        jobId,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", details: err.format() } });
      }
      next(err);
    }
  },

  /**
   * Cancel a booking
   * @route POST /api/bookings/:bookingId/cancel
   */
  async cancelBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const bookingId = req.params.bookingId;
      if (!bookingId) throw new ApiError(400, "MISSING_PARAM", "bookingId is required");

      const userId = req.user?.id;
      if (!userId) throw new ApiError(401, "UNAUTHORIZED", "User not authenticated");

      const updatedBooking = await bookingService.cancelBooking({ bookingId, userId });

      res.status(200).json(updatedBooking);
    } catch (err: any) {
      next(err);
    }
  },
};

export default bookingController;
