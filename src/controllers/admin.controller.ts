/**
 * Admin Controller
 *
 * Handles CRUD operations for events and provides simple analytics endpoints.
 */

import { Request, Response, NextFunction } from "express";
import adminService from "../services/admin.service";
import { ApiError } from "../utils/errors";

const adminController = {
  /**
   * Create a new event
   * POST /admin/events
   */
  async createEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.validatedBody || req.body;
      const event = await adminService.createEvent(payload);
      return res.status(201).json(event);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update an existing event
   * PATCH /admin/events/:eventId
   */
  async updateEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.eventId;
      const payload = req.validatedBody || req.body;

      const updatedEvent = await adminService.updateEvent(eventId, payload);
      return res.status(200).json(updatedEvent);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete an event
   * DELETE /admin/events/:eventId
   */
  async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.eventId;
      await adminService.deleteEvent(eventId);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get event booking analytics
   * GET /admin/analytics?from=...&to=...&groupBy=...
   */
  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to, groupBy } = req.validatedQuery || req.query;
      const data = await adminService.getAnalytics({ from, to, groupBy });
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  },
};

export default adminController;
