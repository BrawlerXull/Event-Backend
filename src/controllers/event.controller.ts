/**
 * Event Controller
 *
 * Handles event-level operations including creating,
 * listing events, retrieving single event details,
 * and applying filters/pagination.
 */

import { Request, Response, NextFunction } from "express";
import eventService from "../services/event.service";
import { ApiError } from "../utils/errors";

const eventController = {
  /**
   * Create a new event
   * POST /api/events
   */
  async createEvent(req: Request, res: Response, next: NextFunction) {
    try {
      // the service handles validation + persistence
      const event = await eventService.createEvent(req.body);
      return res.status(201).json(event);
    } catch (err) {
      next(err);
    }
  },

  /**
   * List events with optional filters and pagination
   * GET /api/events
   */
  async listEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.validatedQuery || req.query;
      const events = await eventService.findMany(filters);
      return res.status(200).json(events);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Retrieve details for a single event
   * GET /api/events/:eventId
   */
  async getEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const event = await eventService.findById(eventId);

      if (!event) {
        throw new ApiError(404, "NOT_FOUND", "Event not found");
      }

      return res.status(200).json(event);
    } catch (err) {
      next(err);
    }
  },
};

export default eventController;
