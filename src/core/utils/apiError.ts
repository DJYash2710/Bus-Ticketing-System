// src/core/utils/apiError.ts
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    details?: unknown,
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}