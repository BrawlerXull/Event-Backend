/**
 * Validation helpers for query params and common fields.
 *
 * Provides:
 *  - parsePagination: safely parse page/limit from query params.
 *  - parseISODate: validate and convert ISO date strings.
 *  - idSchema: reusable UUID validator (Zod).
 *
 * Usage examples:
 *   const { page, limit } = parsePagination(req.query);
 *   const date = parseISODate("2025-09-13T12:00:00Z");
 *   const id = idSchema.parse(req.params.id);
 */

import { z } from "zod";

/**
 * Parse and validate pagination parameters.
 * Defaults: page=1, limit=20
 * Ensures limit <= 100
 */
export function parsePagination(query: any): { page: number; limit: number } {
  let page = 1;
  let limit = 20;

  if (query.page !== undefined) {
    const parsed = parseInt(query.page, 10);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error("Invalid 'page' parameter, must be a positive integer.");
    }
    page = parsed;
  }

  if (query.limit !== undefined) {
    const parsed = parseInt(query.limit, 10);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error("Invalid 'limit' parameter, must be a positive integer.");
    }
    limit = Math.min(parsed, 100);
  }

  return { page, limit };
}

/**
 * Parse and validate ISO date string.
 * Returns Date object or undefined.
 */
export function parseISODate(s?: string): Date | undefined {
  if (!s) return undefined;

  const parsed = z.string().datetime().safeParse(s);
  if (!parsed.success) {
    throw new Error("Invalid ISO date string.");
  }

  return new Date(s);
}

/**
 * UUID validator schema using Zod.
 */
export const idSchema = z.string().uuid();

/**
 * Example reusable validators (expand as needed).
 */
export const emailSchema = z.string().email();
export const positiveIntSchema = z.number().int().positive();
