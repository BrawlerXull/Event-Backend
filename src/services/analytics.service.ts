/**
 * Analytics Service
 *
 * Provides aggregated queries and metrics for events.
 *
 * ⚠️ Consider caching heavy queries in Redis to reduce database load.
 */

import { prisma } from "../utils/db";
import { ApiError } from "../utils/errors";
import logger from "../utils/logger";

interface EventStats {
  eventId: string;
  bookings: number;
  cancellations: number;
  capacityUtilization: number;
  date: string;
}



const analyticsService = {
  /**
   * Get aggregated booking statistics for events
   * @param params - from/to ISO dates, groupBy ("day", "week", "month")
   */
  async getEventStats({
    from,
    to,
    groupBy = "day",
  }: {
    from?: string;
    to?: string;
    groupBy?: "day" | "week" | "month";
  }): Promise<any[]> {
    try {
      // Build Prisma query dynamically based on groupBy
      const bookings = await prisma.booking.groupBy({
        by: ["eventId"],
        _count: { id: true },
        where: {
          createdAt: {
            gte: from ? new Date(from) : undefined,
            lte: to ? new Date(to) : undefined,
          },
        },
      });

      const result: EventStats[] = [];

      for (const b of bookings) {
        const event = await prisma.event.findUnique({ where: { id: b.eventId } });
        if (!event) continue;

        const cancellations = await prisma.booking.count({
          where: { eventId: b.eventId, status: "cancelled" },
        });

        const capacityUtilization = event.capacity
          ? ((b._count.id - cancellations) / event.capacity) * 100
          : 0;

        result.push({
          eventId: b.eventId,
          bookings: b._count.id,
          cancellations,
          capacityUtilization,
          // Optional: date or group field placeholder
          date: from || new Date().toISOString(),
        });
      }

      return result;
    } catch (err: any) {
      logger.error(err, "Failed to fetch event stats");
      throw new ApiError(500, "ANALYTICS_ERROR", "Failed to fetch event stats");
    }
  },

  /**
   * Get top booked events
   * @param limit - number of events to return
   */
  async getTopEvents(limit = 10): Promise<any[]> {
    try {
      const events = await prisma.booking.groupBy({
        by: ["eventId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: limit,
      });

      return events.map((e) => ({ eventId: e.eventId, bookings: e._count.id }));
    } catch (err: any) {
      logger.error(err, "Failed to fetch top events");
      throw new ApiError(500, "ANALYTICS_ERROR", "Failed to fetch top events");
    }
  },
};

export default analyticsService;
