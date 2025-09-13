/**
 * Waitlist Controller
 *
 * Handles user waitlist operations for events.
 */

import { Request, Response, NextFunction } from "express";
import waitlistService from "../services/waitlist.service";
import { ApiError } from "../utils/errors";

const waitlistController = {
  /**
   * Join waitlist for an event
   * POST /events/:eventId/waitlist
   */
  async joinWaitlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, "UNAUTHORIZED", "User must be authenticated");
      }

      const eventId = req.params.eventId;
      const record = await waitlistService.join(eventId, userId);
      return res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Leave waitlist for an event
   * DELETE /events/:eventId/waitlist
   */
  async leaveWaitlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, "UNAUTHORIZED", "User must be authenticated");
      }

      const eventId = req.params.eventId;
      await waitlistService.leave(eventId, userId);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get waitlist for an event (admin-only)
   * GET /admin/events/:eventId/waitlist?page=1&limit=20
   */
  async getWaitlistForEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.eventId;
      const { page = 1, limit = 20 } = req.validatedQuery || req.query;

      const waitlist = await waitlistService.getWaitlist(
        eventId,
        Number(page),
        Number(limit)
      );
      return res.status(200).json(waitlist);
    } catch (err) {
      next(err);
    }
  },
};

export default waitlistController;
