// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { notFoundHandler } from "./core/middleware/notFound.middleware.js";
import { errorHandler } from "./core/middleware/error.middleware.js";
import { authRouter } from "./features/auth/routes.js";
import { busRouter } from "./features/buses/routes.js";
import { cityRouter } from "./features/cities/routes.js";
import { routeRouter } from "./features/routes/routes.js";
import { scheduleRouter } from "./features/schedules/routes.js";
import { seatRouter } from "./features/seats/routes.js";
import { searchRouter } from "./features/search/routes.js";
import { bookingRouter } from "./features/bookings/routes.js";
import { paymentRouter } from "./features/payments/routes.js";
import { adminRouter } from "./features/admin/routes.js";
import { couponRouter } from "./features/coupons/routes.js";
import { loyaltyRouter } from "./features/loyalty/routes.js";
import { userRouter } from "./features/users/routes.js";
import { operatorRouter } from "./features/operators/routes.js";
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev", {
    stream: {
        write: (message) => logger.info(message.trim()),
    },
}));
app.get("/", (_req, res) => {
    res.json({ message: "Bus API up. See /health." });
});
// Health
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        env: env.nodeEnv,
        timestamp: new Date().toISOString(),
    });
});
// Feature routes (prefix with /api/v1)
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/buses", busRouter);
app.use("/api/v1/cities", cityRouter);
app.use("/api/v1/routes", routeRouter);
app.use("/api/v1/schedules", scheduleRouter);
app.use("/api/v1/seats", seatRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/coupons", couponRouter);
app.use("/api/v1/loyalty", loyaltyRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/operators", operatorRouter);
// 404 + error handlers
app.use(notFoundHandler);
app.use(errorHandler);
export { app };
//# sourceMappingURL=app.js.map