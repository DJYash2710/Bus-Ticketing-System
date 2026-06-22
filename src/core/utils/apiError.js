// src/core/utils/apiError.ts
export class ApiError extends Error {
    statusCode;
    isOperational;
    details;
    constructor(statusCode, message, details, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}
//# sourceMappingURL=apiError.js.map