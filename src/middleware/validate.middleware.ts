/**
 * Validation middleware for Express using Zod.
 *
 * Usage example:
 *   import validate from "@/middleware/validate.middleware";
 *   import { z } from "zod";
 *
 *   const createEventSchema = {
 *     body: z.object({
 *       name: z.string().min(1),
 *       date: z.string().datetime(),
 *     }),
 *   };
 *
 *   app.post("/events", validate(createEventSchema), (req, res) => {
 *     // Access validated data:
 *     const data = req.validatedBody;
 *     res.json({ event: data });
 *   });
 */

import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/errors";

export default function validate(schemas: {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.validatedBody = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.validatedQuery = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.validatedParams = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error: any) {
      return next(
        new ApiError(
          400,
          "VALIDATION_ERROR",
          "Validation failed",
          error.format ? error.format() : error.message
        )
      );
    }
  };
}
