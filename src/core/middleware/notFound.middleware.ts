// src/core/middleware/notFound.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";

export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  next(new ApiError(404, `Route ${req.method} ${req.path} not found`));
}
