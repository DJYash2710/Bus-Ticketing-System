import { ApiError } from "../utils/apiError.js";
export function notFoundHandler(req, _res, next) {
    next(new ApiError(404, `Route ${req.method} ${req.path} not found`));
}
//# sourceMappingURL=notFound.middleware.js.map