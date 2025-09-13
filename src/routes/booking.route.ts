/**
 * Booking Routes
 *
 * Handles ticket booking and cancellation.
 *
 * Notes:
 * - Idempotency: For POST /api/events/:eventId/book, clients can send an
 *   `Idempotency-Key` header to prevent duplicate bookings in case of retries.
 * - All routes require authentication.
 */

import { Router } from "express";
import bookingController from "../controllers/booking.controller";
import { requireAuth } from "../middleware/auth.middlware";
import validate from "../middleware/validate.middleware";
import { z } from "zod";

const router = Router();

/**
 * Body schema for creating a booking
 */
const createBookingBodySchema = z.object({
  seats: z.number().int().positive(),
  seat_ids: z.array(z.string()).optional(),
  payment_method: z.string().optional(),
});

/**
 * POST /api/events/:eventId/book
 * Create a booking for an event
 */
router.post(
  "/events/:eventId/book",
  requireAuth,
  validate({ body: createBookingBodySchema }),
  bookingController.createBooking
);

/**
 * POST /api/bookings/:bookingId/cancel
 * Cancel an existing booking
 */
router.post(
  "/bookings/:bookingId/cancel",
  requireAuth,
  bookingController.cancelBooking
);

export default router;
