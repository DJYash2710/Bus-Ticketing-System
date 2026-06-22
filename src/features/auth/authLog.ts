import { logger } from "../../config/logger.js";

type AuthLogMeta = {
  event: string;
  userId?: number;
  email?: string;
  ip?: string;
};

export function logAuthEvent(
  level: "info" | "warn",
  message: string,
  meta: AuthLogMeta,
) {
  logger.log(level, message, {
    category: "auth",
    ...meta,
    timestamp: new Date().toISOString(),
  });
}
