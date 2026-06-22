import { getLoyaltyHistory, getLoyaltySummary } from "./service.js";
export async function getLoyaltySummaryController(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const result = await getLoyaltySummary(userId);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function getLoyaltyHistoryController(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const result = await getLoyaltyHistory(userId);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=controller.js.map