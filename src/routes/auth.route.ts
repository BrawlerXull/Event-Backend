/**
 * Auth Routes
 *
 * Handles user signup, login, and token refresh.
 */

import { Router } from "express";
import authController from "../controllers/auth.controller";
import validate from "../middleware/validate.middleware";
import { z } from "zod";

const router = Router();

/**
 * @route POST /api/auth/signup
 * @body { email: string, password: string, name?: string }
 */
router.post(
  "/signup",
  validate({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().optional(),
    }),
  }),
  authController.signup
);

/**
 * @route POST /api/auth/login
 * @body { email: string, password: string }
 */
router.post(
  "/login",
  validate({
    body: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  }),
  authController.login
);

/**
 * @route POST /api/auth/refresh
 * @body { refreshToken: string }
 */
router.post(
  "/refresh",
  validate({
    body: z.object({
      refreshToken: z.string(),
    }),
  }),
  authController.refreshToken
);

export default router;
