/**
 * Waitlist Routes
 *
 * Handles user waitlist operations for events.
 */

import { Router } from "express";
import waitlistController from "../controllers/waitlist.controller";
import { requireAuth } from "../middleware/auth.middlware";

const router = Router();

/**
 * POST /api/events/:eventId/waitlist
 * User joins the waitlist
 */
router.post(
  "/events/:eventId/waitlist",
  requireAuth,
  waitlistController.joinWaitlist
);

/**
 * DELETE /api/events/:eventId/waitlist
 * User leaves the waitlist
 */
router.delete(
  "/events/:eventId/waitlist",
  requireAuth,
  waitlistController.leaveWaitlist
);

/**
 * GET /api/events/:eventId/waitlist
 * Admin or event organizer views the waitlist
 */
router.get(
  "/events/:eventId/waitlist",
  requireAuth,
  waitlistController.getWaitlistForEvent
);

export default router;
