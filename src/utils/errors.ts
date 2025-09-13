/**
 * Centralized error utilities for Evently backend.
 *
 * Provides:
 *  - ApiError class for consistent error objects.
 *  - createError helper for convenience.
 *  - Express error handler middleware.
 *
 * ⚠️ Security Note:
 * Do not leak internal error details to clients in production.
 * Only expose safe messages & codes.
 */

import { Request, Response, NextFunction } from "express";
import logger from "./logger";

/**
 * Custom API error class with status code, error code, and optional details.
 */
export class ApiError extends Error {
  status: number;
  code: string;
  details?: any;

  constructor(status: number, code: string, message: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;

    // Fix prototype chain (for instanceof checks)
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Convenience factory for ApiError.
 */
export function createError(
  status: number,
  code: string,
  message: string,
  details?: any
): ApiError {
  return new ApiError(status, code, message, details);
}

/**
 * Express global error handler middleware.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Unexpected error — log full details internally
  logger.error(err);

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
    },
  });
}
