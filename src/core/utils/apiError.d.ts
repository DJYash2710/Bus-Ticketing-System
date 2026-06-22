export declare class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    details?: unknown;
    constructor(statusCode: number, message: string, details?: unknown, isOperational?: boolean);
}
//# sourceMappingURL=apiError.d.ts.map