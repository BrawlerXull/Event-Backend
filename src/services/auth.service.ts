/**
 * Authentication Service
 *
 * Handles user signup, login, and token refresh.
 */

import UserRepo from "../repositories/user.repo";
import { ApiError } from "../utils/errors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET ?? "change_me";
const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";

interface SignupInput {
  email: string;
  password: string;
  name?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const authService = {
  /**
   * Register a new user
   */
  async signup({ email, password, name }: SignupInput) {
    try {
      const existing = await UserRepo.findByEmail(email);
      if (existing) {
        throw new ApiError(409, "EMAIL_EXISTS", "Email is already registered");
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await UserRepo.create({
        email,
        password: passwordHash,
        name: name ?? "", 
        role: "user",
      });


      const accessToken = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_TTL });
      const refreshToken = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: REFRESH_TTL });

      return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, accessToken, refreshToken };
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, "SIGNUP_FAILED", "Failed to create user", err);
    }
  },

  /**
   * Authenticate existing user
   */
  async login({ email, password }: LoginInput) {
    try {
      const user = await UserRepo.findByEmail(email);
      if (!user) {
        throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
      }

      const accessToken = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_TTL });
      const refreshToken = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: REFRESH_TTL });

      return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, accessToken, refreshToken };
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, "LOGIN_FAILED", "Failed to authenticate user", err);
    }
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(token: string) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { sub: string; role?: string };

      const user = await UserRepo.findById(payload.sub);
      if (!user) {
        throw new ApiError(401, "INVALID_TOKEN", "User not found for provided token");
      }

      const accessToken = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_TTL });
      const refreshToken = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: REFRESH_TTL });

      return { accessToken, refreshToken };
    } catch (err: any) {
      if (err instanceof jwt.JsonWebTokenError) {
        throw new ApiError(401, "INVALID_TOKEN", "Invalid or expired refresh token", err);
      }
      throw new ApiError(500, "REFRESH_FAILED", "Failed to refresh token", err);
    }
  },
};

export default authService;
