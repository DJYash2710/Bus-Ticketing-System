import { searchSchedules } from "./service.js";
export async function searchSchedulesController(req, res, next) {
    try {
        const fromCityId = Number(req.query.fromCityId);
        const toCityId = Number(req.query.toCityId);
        const date = String(req.query.date);
        const result = await searchSchedules({
            fromCityId,
            toCityId,
            date,
        });
        res.json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=controller.js.map