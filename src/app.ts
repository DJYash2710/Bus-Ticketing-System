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
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(
  morgan("dev", {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }),
);
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

// 404 + error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
