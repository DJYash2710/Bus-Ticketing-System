import { createSchedule, listSchedules, getScheduleById, updateSchedule, deleteSchedule, } from "./service.js";
function getCaller(req) {
    return req.user;
}
export async function createScheduleController(req, res, next) {
    try {
        const schedule = await createSchedule({
            ...req.body,
            routeId: Number(req.body.routeId),
            busId: Number(req.body.busId),
        }, getCaller(req));
        res.status(201).json({ success: true, data: schedule });
    }
    catch (err) {
        next(err);
    }
}
export async function listSchedulesController(req, res, next) {
    try {
        const routeId = typeof req.query.routeId === "string"
            ? Number(req.query.routeId)
            : undefined;
        const busId = typeof req.query.busId === "string" ? Number(req.query.busId) : undefined;
        const status = typeof req.query.status === "string"
            ? req.query.status
            : undefined;
        const date = typeof req.query.date === "string" ? req.query.date : undefined;
        const filters = {};
        if (routeId !== undefined)
            filters.routeId = routeId;
        if (busId !== undefined)
            filters.busId = busId;
        if (status !== undefined)
            filters.status = status;
        if (date !== undefined)
            filters.date = date;
        const schedules = await listSchedules(filters, getCaller(req));
        res.json({ success: true, data: schedules });
    }
    catch (err) {
        next(err);
    }
}
export async function getScheduleByIdController(req, res, next) {
    try {
        const id = Number(req.params.id);
        const schedule = await getScheduleById(id, getCaller(req));
        res.json({ success: true, data: schedule });
    }
    catch (err) {
        next(err);
    }
}
export async function updateScheduleController(req, res, next) {
    try {
        const id = Number(req.params.id);
        const schedule = await updateSchedule(id, req.body, getCaller(req));
        res.json({ success: true, data: schedule });
    }
    catch (err) {
        next(err);
    }
}
export async function deleteScheduleController(req, res, next) {
    try {
        const id = Number(req.params.id);
        const result = await deleteSchedule(id, getCaller(req));
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=controller.js.map