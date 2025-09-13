/**
 * Centralized error middleware.
 * 
 * Mount this as last middleware in app.ts
 */

import { errorHandler } from "../utils/errors";

export default errorHandler;
