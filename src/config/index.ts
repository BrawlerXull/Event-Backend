/**
 * Typed config loader using process.env with sane defaults.
 *
 * Loads environment variables via dotenv and validates required fields.
 * Make sure you create a `.env` file in the project root with keys like:
 *
 * DATABASE_URL=postgres://user:pass@localhost:5432/evently
 * JWT_SECRET=supersecretkey
 *
 * Example usage:
 *   import config from "@/config";
 *   console.log(`Server running on port ${config.PORT}`);
 */

import dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Please set it in your .env file.`
    );
  }
  return value;
}

const config = {
  PORT: parseInt(process.env.PORT || "4000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: requireEnv("DATABASE_URL"),
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  JWT_SECRET: requireEnv("JWT_SECRET"),
  SENTRY_DSN: process.env.SENTRY_DSN,
  ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL || "15m",
  REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL || "7d",
};

export default config;
