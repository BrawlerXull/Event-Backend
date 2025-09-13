/**
 * Event Service
 *
 * Business logic for managing events.
 * - Handles creation, retrieval, and querying.
 * - Delegates all persistence to EventRepo.
 * - Booking-related operations are handled separately in booking.service.ts
 */

import EventRepo from "../repositories/event.repo";
import { ApiError } from "../utils/errors";
import { Event } from "@prisma/client";

/**
 * Data Transfer Objects (DTOs)
 */
export interface EventCreateDTO {
  name: string;
  description?: string;
  venue: string;
  start_time: string;
  end_time: string;
  capacity: number;
  metadata?: any;
}

export interface EventQuery {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  q?: string;
}

const EventService = {
  /**
   * Create a new event
   * @param payload - Event creation DTO
   * @returns Created Event
   */
  async createEvent(payload: EventCreateDTO): Promise<Event> {
    try {
      if (payload.capacity <= 0) {
        throw new ApiError(400, "INVALID_CAPACITY", "Event capacity must be greater than 0");
      }

      const event = await EventRepo.create(payload);
      return event;
    } catch (err: any) {
      throw new ApiError(500, "EVENT_CREATE_FAILED", err.message || "Failed to create event");
    }
  },

  /**
   * Find many events with optional filters and pagination
   * @param query - Query parameters (page, limit, date range, search query)
   * @returns Paginated list of events
   */
   async findMany(query: EventQuery): Promise<{ data: Event[]; total: number }> {
    try {
        const result = await EventRepo.findMany(query);
        return { data: result.events, total: result.total }; // map to expected shape
    } catch (err: any) {
        throw new ApiError(500, "EVENT_FETCH_FAILED", err.message || "Failed to fetch events");
    }
   },

  /**
   * Find an event by its ID
   * @param eventId - Event identifier
   * @returns Event or null if not found
   */
  async findById(eventId: string): Promise<Event | null> {
    try {
      return await EventRepo.findById(eventId);
    } catch (err: any) {
      throw new ApiError(500, "EVENT_FETCH_FAILED", err.message || "Failed to fetch event");
    }
  },
};

export default EventService;
