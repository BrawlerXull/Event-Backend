/**
 * Authentication & Authorization middleware for Evently.
 *
 * Provides:
 *  - requireAuth: validates JWT access tokens and attaches user to req.user.
 *  - requireAdmin: enforces admin-only access.
 *
 * Usage example:
 *   import { requireAuth, requireAdmin } from "@/middleware/auth.middleware";
 *
 *   // Protect user routes
 *   app.get("/me", requireAuth, (req, res) => {
 *     res.json({ user: req.user });
 *   });
 *
 *   // Protect admin routes
 *   app.post("/admin/events", requireAuth, requireAdmin, (req, res) => {
 *     res.json({ message: "Admin event created" });
 *   });
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { ApiError } from "../utils/errors";
import UserRepo from "../repositories/user.repo";
import logger from "../utils/logger";

/**
 * Middleware: requireAuth
 * Validates JWT and attaches user object to req.user
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new ApiError(401, "UNAUTHORIZED", "Missing Authorization header")
      );
    }

    const token = authHeader.split(" ")[1];
    let payload: any;

    try {
      payload = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
      return next(new ApiError(401, "UNAUTHORIZED", "Invalid or expired token"));
    }

    const userId = (payload as any).sub;
    const role = (payload as any).role;

    if (!userId) {
      return next(new ApiError(401, "UNAUTHORIZED", "Invalid token payload"));
    }

    const user = await UserRepo.findById(userId);
    if (!user) {
      return next(new ApiError(401, "UNAUTHORIZED", "User not found"));
    }

    req.user = { id: user.id, email: user.email, role: user.role ?? role };
    next();
  } catch (err) {
    logger.error(err);
    next(new ApiError(500, "INTERNAL_ERROR", "Auth middleware error"));
  }
}

/**
 * Middleware: requireAdmin
 * Requires authenticated user with role "admin"
 */
export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(new ApiError(401, "UNAUTHORIZED", "Authentication required"));
  }

  if (req.user.role !== "admin") {
    return next(new ApiError(403, "FORBIDDEN", "Admin only"));
  }

  next();
}
