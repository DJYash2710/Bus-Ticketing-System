// src/core/utils/apiError.ts
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Restore prototype chain (for instanceof checks)
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}