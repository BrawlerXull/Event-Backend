/**
 * Admin Routes
 *
 * Provides CRUD endpoints for events and analytics for admin users.
 */

import { Router } from "express";
import adminController from "../controllers/admin.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middlware";
import validate from "../middleware/validate.middleware";
import { z } from "zod";

const router = Router();

/**
 * Zod schema for creating an event
 */
const createEventSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  venue: z.string(),
  start_time: z.string(), // ISO string
  end_time: z.string(),   // ISO string
  capacity: z.number().int().positive(),
  metadata: z.any().optional(),
});



/**
 * POST /api/admin/events
 * Create a new event
 */
router.post(
  "/events",
  requireAuth,
  requireAdmin,
  validate({ body: createEventSchema }),
  adminController.createEvent
);

/**
 * PUT /api/admin/events/:eventId
 * Update an existing event
 */
router.put(
  "/events/:eventId",
  requireAuth,
  requireAdmin,
  adminController.updateEvent
);

/**
 * DELETE /api/admin/events/:eventId
 * Delete an event
 */
router.delete(
  "/events/:eventId",
  requireAuth,
  requireAdmin,
  adminController.deleteEvent
);

/**
 * GET /api/admin/analytics
 * Fetch analytics data
 */
router.get(
  "/analytics",
  requireAuth,
  requireAdmin,
  adminController.getAnalytics
);

export default router;
