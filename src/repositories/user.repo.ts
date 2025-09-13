/**
 * User Repository
 *
 * Provides Prisma-based CRUD operations for users.
 */

import { prisma } from "../utils/db";
import { ApiError } from "../utils/errors";

const UserRepo = {
  /**
   * Create a new user
   */
  async create({
    email,
    passwordHash,
    name,
    role = "user",
  }: {
    email: string;
    passwordHash: string;
    name: string;
    role?: string;
  }) {
    try {
      return await prisma.user.create({
        data: { email, passwordHash, name, role },
      });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * Find a user by email
   */
  async findByEmail(email: string) {
    try {
      return await prisma.user.findUnique({ where: { email } });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },

  /**
   * Find a user by ID
   */
  async findById(id: string) {
    try {
      return await prisma.user.findUnique({ where: { id } });
    } catch (err: any) {
      throw new ApiError(500, "DB_ERROR", err.message);
    }
  },
};

export default UserRepo;
