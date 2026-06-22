import { ApiError } from "../utils/apiError.js";
export function requireRole(allowedRoles) {
    return (req, _res, next) => {
        const user = req.user;
        if (!user) {
            return next(new ApiError(401, "Authentication required"));
        }
        if (!allowedRoles.includes(user.role)) {
            return next(new ApiError(403, "You do not have permission to perform this action"));
        }
        next();
    };
}
//# sourceMappingURL=role.middleware.js.map