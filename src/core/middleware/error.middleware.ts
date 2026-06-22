// src/core/middleware/error.middleware.ts
import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Log full error for debugging / audit
  logger.error({
    statusCode,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // In dev you can expose more info
  const responseBody: Record<string, unknown> = {
    success: false,
    message,
  };

  if (env.nodeEnv === 'development') {
    responseBody.stack = err.stack;
  }

  if (err instanceof ApiError && err.details !== undefined) {
    responseBody.details = err.details;
  }

  res.status(statusCode).json(responseBody);
}