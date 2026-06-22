// src/core/utils/apiError.ts
export class ApiError extends Error {
    statusCode;
    isOperational;
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        // Restore prototype chain (for instanceof checks)
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}
//# sourceMappingURL=apiError.js.map