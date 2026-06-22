import { registerUser, loginUser, refreshTokens, logoutUser } from "./service.js";
import { auditContextFromRequest } from "../../core/audit/requestContext.js";
function getClientMeta(req) {
    return {
        userAgent: req.headers["user-agent"] ?? "unknown",
        ipAddress: req.ip ?? "unknown",
    };
}
export async function registerController(req, res, next) {
    try {
        const result = await registerUser(req.body, getClientMeta(req));
        res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
}
export async function loginController(req, res, next) {
    try {
        const result = await loginUser(req.body, getClientMeta(req));
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
}
export async function refreshController(req, res, next) {
    try {
        const result = await refreshTokens(req.body.refreshToken, getClientMeta(req));
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function logoutController(req, res, next) {
    try {
        const userId = req.user.id;
        const result = await logoutUser(userId, req.ip ?? "unknown", auditContextFromRequest(req));
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=controller.js.map