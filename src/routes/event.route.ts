/**
 * Event Routes
 *
 * Handles CRUD for events.
 *
 * Mount in app.ts:
 *   import eventRouter from "./routes/event.route";
 *   app.use("/api/events", eventRouter);
 */

import { Router } from "express";
import eventController from "../controllers/event.controller";
import validate from "../middleware/validate.middleware";
import { requireAuth } from "../middleware/auth.middlware";
import { z } from "zod";

const router = Router();

/**
 * Validation schema for creating/updating an event
 */
const eventSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  venue: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  capacity: z.number().int().positive(),
  metadata: z.record(z.string(), z.string()).optional(),
});

/**
 * Optional query validation schema for listing events
 */
const listEventsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  q: z.string().optional(),
});

/**
 * POST /api/events
 * Create a new event
 */
router.post(
  "/",
  requireAuth, // protect route (optional, remove if public)
  validate({ body: eventSchema }),
  eventController.createEvent
);

/**
 * GET /api/events
 * List events
 */
router.get(
  "/",
  validate({ query: listEventsQuerySchema }),
  eventController.listEvents
);


/**
 * GET /api/events/:eventId
 * Retrieve single event details
 */
router.get("/:eventId", eventController.getEvent);

export default router;
