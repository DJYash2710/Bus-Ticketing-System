import { registerUser, loginUser, refreshTokens, logoutUser } from "./service.js";
export async function registerController(req, res, next) {
    try {
        const result = await registerUser(req.body);
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
        const result = await loginUser(req.body);
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
        const result = await refreshTokens(req.body.refreshToken);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function logoutController(req, res, next) {
    try {
        const userId = req.user.id;
        const result = await logoutUser(userId);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=controller.js.map