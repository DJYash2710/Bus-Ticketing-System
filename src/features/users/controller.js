import { changeUserPassword, getUserProfile, updateUserProfile, } from "./service.js";
export async function getProfileController(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const result = await getUserProfile(userId);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function updateProfileController(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const result = await updateUserProfile(userId, req.body);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function changePasswordController(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const result = await changeUserPassword(userId, req.body);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=controller.js.map