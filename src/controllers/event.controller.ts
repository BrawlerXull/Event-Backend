/**
 * Event Routes
 *
 * Handles listing and retrieving events.
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
 * Optional query validation schema for listing events
 */
const listEventsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  q: z.string().optional(), // search query
});

/**
 * GET /api/events
 * List events with optional filters & pagination
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
