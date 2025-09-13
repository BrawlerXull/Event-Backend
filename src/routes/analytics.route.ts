/**
 * Analytics Routes
 *
 * Provides endpoints for event analytics (admin access required)
 */

import { Router } from "express";
import analyticsController from "../controllers/analytics.controller";
import { requireAdmin } from "../middleware/auth.middlware";

const router = Router();

/**
 * GET /api/analytics/events
 * Get event statistics
 */
router.get("/events", requireAdmin, analyticsController.getEventStats);

/**
 * GET /api/analytics/top-events
 * Get top booked events
 */
router.get("/top-events", requireAdmin, analyticsController.getTopEvents);

export default router;
