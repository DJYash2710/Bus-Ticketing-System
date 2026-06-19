// src/core/middleware/role.middleware.ts
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError.js";
import type { AuthUser } from "./auth.middleware.js";

export function requireRole(allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user as AuthUser | undefined;

    if (!user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(user.role)) {
      return next(
        new ApiError(403, "You do not have permission to perform this action"),
      );
    }

    next();
  };
}
