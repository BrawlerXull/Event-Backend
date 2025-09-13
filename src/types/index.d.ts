/**
 * Global type augmentations for Evently backend.
 *
 * Place lightweight types here; prefer module-level DTOs for large interfaces.
 */

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
        [key: string]: any;
      };
      validatedBody?: any;
      validatedQuery?: any;
      validatedParams?: any;
    }
  }
}

// Example shared DTOs (expand as needed)
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: string;
}

// Needed so TS treats this as a module
export {};
