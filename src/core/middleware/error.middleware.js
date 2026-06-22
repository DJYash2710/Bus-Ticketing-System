import { ApiError } from '../utils/apiError.js';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err, req, res, _next) {
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
    const responseBody = {
        success: false,
        message,
    };
    if (env.nodeEnv === 'development') {
        responseBody.stack = err.stack;
    }
    res.status(statusCode).json(responseBody);
}
//# sourceMappingURL=error.middleware.js.map