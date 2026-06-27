import { verifyAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";
export function authMiddleware(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next(new ApiError(401, "Authentication required"));
    }
    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
        return next(new ApiError(401, "Authentication required"));
    }
    try {
        const payload = verifyAccessToken(token); // token is now definitely string
        req.user = {
            id: Number(payload.sub),
            role: payload.role,
            busOperatorId: payload.busOperatorId ?? null,
        };
        next();
    }
    catch {
        next(new ApiError(401, "Invalid or expired token"));
    }
}
//# sourceMappingURL=auth.middleware.js.map