/**
 * Main Express App
 *
 * Configures middleware, routes, and error handling for Evently backend.
 */

import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

import eventRouter from "./routes/event.route";
import bookingRouter from "./routes/booking.route";
import authRouter from "./routes/auth.route";
import adminRouter from "./routes/admin.route";
import analyticsRouter from "./routes/analytics.route";
import waitlistRouter from "./routes/waitlist.route";
import seatRouter from "./routes/seat.route";
import healthRouter from "./routes/health.route";

import errorHandler from "./middleware/error.middleware";
import logger from "./utils/logger";

const app = express();

/**
 * Global Middleware
 */
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

/**
 * API Routes
 */
app.use("/api/events", eventRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/waitlist", waitlistRouter);
app.use("/api/seats", seatRouter);
app.use(healthRouter); // mounts /health and /ready

/**
 * Swagger docs (optional)
 * e.g., app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
 */

/**
 * Error handling middleware (should be last)
 */
app.use(errorHandler);

export default app;
