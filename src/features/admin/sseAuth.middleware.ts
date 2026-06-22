import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../../core/utils/jwt.js";
import { ApiError } from "../../core/utils/apiError.js";
import type { AuthUser } from "../../core/middleware/auth.middleware.js";

/**
 * SSE auth for GET /admin/logs/stream only.
 * EventSource cannot send Authorization headers, so this endpoint accepts
 * the access token via ?token= — a deliberate, scoped exception.
 */
export function adminSseAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const token =
    typeof req.query.token === "string" ? req.query.token : undefined;

  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  try {
    const payload = verifyAccessToken(token);
    if (payload.role !== "ADMIN") {
      return next(new ApiError(403, "Forbidden"));
    }
    req.user = {
      id: payload.sub,
      role: payload.role,
      busOperatorId: payload.busOperatorId ?? null,
    } satisfies AuthUser;
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}
