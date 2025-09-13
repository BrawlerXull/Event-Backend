/**
 * Seat Routes
 *
 * Provides endpoints for seat-level operations in events.
 */

import { Router } from "express";
import seatController from "../controllers/seat.controller";
import { requireAuth } from "../middleware/auth.middlware";
import validate from "../middleware/validate.middleware";
import { z } from "zod";

const router = Router();

/**
 * Zod schema for holding seats
 */
const holdSeatsSchema = z.object({
  seatIds: z.array(z.string().uuid()),
});

/**
 * GET /api/events/:eventId/seats
 * List all seats for an event
 */
router.get("/events/:eventId/seats", seatController.listSeats);

/**
 * POST /api/events/:eventId/seats/hold
 * Hold seats for a user
 */
router.post(
  "/events/:eventId/seats/hold",
  requireAuth,
  validate({ body: holdSeatsSchema }),
  seatController.holdSeats
);

/**
 * POST /api/events/:eventId/seats/confirm
 * Confirm held seats (optional)
 */
router.post(
  "/events/:eventId/seats/confirm",
  requireAuth,
  seatController.confirmSeats
);

export default router;
