/**
 * Analytics Controller
 *
 * Exposes endpoints for event statistics and top events.
 * 
 * ⚠️ Consider caching heavy queries in Redis to reduce database load.
 */

import { Request, Response, NextFunction } from "express";
import analyticsService from "../services/analytics.service";
import { ApiError } from "../utils/errors";

const analyticsController = {
  /**
   * Get event statistics
   * GET /analytics/events?from=...&to=...&groupBy=...
   */
  async getEventStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to, groupBy } = req.validatedQuery || req.query;
      const stats = await analyticsService.getEventStats({ from, to, groupBy });
      return res.status(200).json(stats);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get top booked events
   * GET /analytics/top-events?limit=...
   */
  async getTopEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt((req.validatedQuery?.limit as string) || req.query.limit || "10", 10);
      if (isNaN(limit) || limit <= 0) {
        throw new ApiError(400, "INVALID_PARAM", "Limit must be a positive integer");
      }

      const events = await analyticsService.getTopEvents(limit);
      return res.status(200).json(events);
    } catch (err) {
      next(err);
    }
  },
};

export default analyticsController;
