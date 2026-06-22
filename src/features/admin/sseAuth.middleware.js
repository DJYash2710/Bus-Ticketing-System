import { verifyAccessToken } from "../../core/utils/jwt.js";
import { ApiError } from "../../core/utils/apiError.js";
/**
 * SSE auth for GET /admin/logs/stream only.
 * EventSource cannot send Authorization headers, so this endpoint accepts
 * the access token via ?token= — a deliberate, scoped exception.
 */
export function adminSseAuthMiddleware(req, _res, next) {
    const token = typeof req.query.token === "string" ? req.query.token : undefined;
    if (!token) {
        return next(new ApiError(401, "Authentication required"));
    }
    try {
        const payload = verifyAccessToken(token);
        if (payload.role !== "ADMIN") {
            return next(new ApiError(403, "Forbidden"));
        }
        req.user = {
            id: payload.sub,
            role: payload.role,
            busOperatorId: payload.busOperatorId ?? null,
        };
        next();
    }
    catch {
        next(new ApiError(401, "Invalid or expired token"));
    }
}
//# sourceMappingURL=sseAuth.middleware.js.map