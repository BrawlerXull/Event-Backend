/**
 * Seat Controller
 *
 * Handles seat-level operations for event seating, including listing,
 * holding, and confirming seats.
 */

import { Request, Response, NextFunction } from "express";
import seatService from "../services/seat.service";
import { ApiError } from "../utils/errors";

const seatController = {
  /**
   * List seats for an event with optional filters
   * GET /events/:eventId/seats
   */
  async listSeats(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.eventId;
      const filters = req.validatedQuery || req.query;
      const seats = await seatService.listSeats(eventId, filters);
      return res.status(200).json(seats);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Hold specific seats for a user
   * POST /events/:eventId/seats/hold
   * Body: { seatIds: string[], holdSeconds?: number }
   */
  async holdSeats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, "UNAUTHORIZED", "User must be authenticated");
      }

      const eventId = req.params.eventId;
      const { seatIds, holdSeconds } = req.validatedBody || req.body;

      if (!Array.isArray(seatIds) || seatIds.length === 0) {
        throw new ApiError(400, "INVALID_INPUT", "seatIds must be a non-empty array");
      }

      const holdResult = await seatService.holdSeats({
        eventId,
        seatIds,
        userId,
        holdSeconds,
      });

      return res.status(200).json(holdResult);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Confirm held seats to finalize booking (optional)
   * POST /events/:eventId/seats/confirm
   * Body: { holdToken: string }
   */
  async confirmSeats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, "UNAUTHORIZED", "User must be authenticated");
      }

      const eventId = req.params.eventId;
      const { holdToken } = req.validatedBody || req.body;

      if (!holdToken) {
        throw new ApiError(400, "INVALID_INPUT", "holdToken is required");
      }

      const confirmedSeats = await seatService.confirmSeats({ eventId, holdToken, userId });
      return res.status(200).json(confirmedSeats);
    } catch (err) {
      next(err);
    }
  },
};

export default seatController;
