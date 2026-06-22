import { SeatStatus } from "@prisma/client";
import { getSeatById, listSeatsBySchedule, updateSeatStatus, } from "./service.js";
export async function listSeatsByScheduleController(req, res, next) {
    try {
        const scheduleId = Number(req.params.scheduleId);
        const status = typeof req.query.status === "string"
            ? req.query.status
            : undefined;
        const filters = { scheduleId };
        if (status !== undefined) {
            filters.status = status;
        }
        const result = await listSeatsBySchedule(filters);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
}
export async function getSeatByIdController(req, res, next) {
    try {
        const id = Number(req.params.id);
        const seat = await getSeatById(id);
        res.json({
            success: true,
            data: seat,
        });
    }
    catch (err) {
        next(err);
    }
}
export async function updateSeatStatusController(req, res, next) {
    try {
        const id = Number(req.params.id);
        const seat = await updateSeatStatus(id, {
            status: req.body.status,
        }, req.user);
        res.json({
            success: true,
            data: seat,
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=controller.js.map