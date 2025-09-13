/**
 * Authentication Controller
 *
 * Handles signup, login, and token refresh.
 */

import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";
import { ApiError } from "../utils/errors";
import { z } from "zod";

const authController = {
  /**
   * User signup
   * @route POST /api/auth/signup
   */
  async signup(req: Request, res: Response, next: NextFunction) {
    const SignupSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(1).optional(),
    });

    try {
      const { email, password, name } = SignupSchema.parse(req.body);

      const result = await authService.signup({ email, password, name });

      return res.status(201).json({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (err: any) {
      if (err instanceof ApiError && err.code === "EMAIL_EXISTS") {
        return res.status(409).json({ error: { code: err.code, message: err.message } });
      }
      next(err);
    }
  },

  /**
   * User login
   * @route POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    const LoginSchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    try {
      const { email, password } = LoginSchema.parse(req.body);

      const result = await authService.login({ email, password });

      return res.status(200).json({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Refresh access token
   * @route POST /api/auth/refresh
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    const RefreshSchema = z.object({
      refreshToken: z.string(),
    });

    try {
      const { refreshToken } = RefreshSchema.parse(req.body);

      const tokens = await authService.refreshToken(refreshToken);

      return res.status(200).json(tokens);
    } catch (err) {
      next(err);
    }
  },
};

export default authController;
