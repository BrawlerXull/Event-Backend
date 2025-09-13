/**
 * Admin Service
 *
 * Handles event management operations and aggregates analytics.
 */

import EventRepo from "../repositories/event.repo";
import { ApiError } from "../utils/errors";
import analyticsService from "./analytics.service";

type GroupBy = "day" | "week" | "month";

const adminService = {
  /**
   * Create a new event
   * @param payload - Event data
   */
  async createEvent(payload: any) {
    try {
      if (!payload.capacity || payload.capacity <= 0) {
        throw new ApiError(400, "INVALID_INPUT", "Event capacity must be a positive number");
      }

      const event = await EventRepo.create(payload);
      return event;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, "EVENT_CREATION_FAILED", err.message);
    }
  },

  /**
   * Update an existing event
   * @param eventId - ID of the event
   * @param payload - Updated event data
   */
  async updateEvent(eventId: string, payload: any) {
    try {
      const updatedEvent = await EventRepo.update(eventId, payload);
      if (!updatedEvent) {
        throw new ApiError(404, "NOT_FOUND", `Event ${eventId} not found`);
      }
      return updatedEvent;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, "EVENT_UPDATE_FAILED", err.message);
    }
  },

  /**
   * Delete an event
   * @param eventId - ID of the event
   */
  async deleteEvent(eventId: string) {
    try {
      const deleted = await EventRepo.delete(eventId);
      if (!deleted) {
        throw new ApiError(404, "NOT_FOUND", `Event ${eventId} not found`);
      }
      return deleted;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, "EVENT_DELETION_FAILED", err.message);
    }
  },

  /**
   * Get analytics for events
   * Delegates to analyticsService
   */

   async getAnalytics(params: { from?: string; to?: string; groupBy?: string }) {
    try {
        // Validate / cast groupBy
        let groupBy: GroupBy | undefined;
        if (params.groupBy) {
        if (["day", "week", "month"].includes(params.groupBy)) {
            groupBy = params.groupBy as GroupBy;
        } else {
            throw new ApiError(400, "INVALID_INPUT", "groupBy must be 'day', 'week' or 'month'");
        }
        }

        return await analyticsService.getEventStats({
        from: params.from,
        to: params.to,
        groupBy,
        });
    } catch (err: any) {
        throw new ApiError(500, "ANALYTICS_FETCH_FAILED", err.message);
    }
   }

};

export default adminService;
