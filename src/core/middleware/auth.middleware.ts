// src/core/middleware/auth.middleware.ts
import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";

export type AuthUser = {
  id: number;
  role: string;
};

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new ApiError(401, "Authentication required"));
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new ApiError(401, "Authentication required"));
  }

  try {
    const payload = verifyAccessToken(token); // token is now definitely string
    req.user = {
      id: payload.sub,
      role: payload.role,
    };
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}
