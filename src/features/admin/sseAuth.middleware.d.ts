import type { NextFunction, Request, Response } from "express";
/**
 * SSE auth for GET /admin/logs/stream only.
 * EventSource cannot send Authorization headers, so this endpoint accepts
 * the access token via ?token= — a deliberate, scoped exception.
 */
export declare function adminSseAuthMiddleware(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=sseAuth.middleware.d.ts.map