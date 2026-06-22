import type { RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

type RateLimitProfile = "strict" | "moderate";

const MESSAGES: Record<RateLimitProfile, string> = {
  strict: "Too many requests. Please try again later.",
  moderate: "Too many search requests. Please slow down.",
};

function createRateLimiter(profile: RateLimitProfile): RequestHandler {
  const config =
    profile === "strict" ? env.rateLimit.strict : env.rateLimit.moderate;

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => !env.rateLimit.enabled,
    handler: (req, res, _next, options) => {
      logger.warn("Rate limit exceeded", {
        category: "security",
        event: "rate_limit_exceeded",
        profile,
        ip: req.ip,
        method: req.method,
        path: req.originalUrl,
      });

      res.status(options.statusCode).json({
        success: false,
        message: MESSAGES[profile],
      });
    },
  });
}

/** Auth, bookings, payments — sensitive write endpoints. */
export const strictRateLimiter = createRateLimiter("strict");

/** Search and similar read-heavy endpoints. */
export const moderateRateLimiter = createRateLimiter("moderate");
