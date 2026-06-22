import { createSchedule, listSchedules, getScheduleById, updateSchedule, deleteSchedule, } from "./service.js";
import { auditContextFromRequest } from "../../core/audit/requestContext.js";
function getCaller(req) {
    return req.user;
}
export async function createScheduleController(req, res, next) {
    try {
        const result = await createSchedule({
            ...req.body,
            routeId: Number(req.body.routeId),
            busId: Number(req.body.busId),
        }, getCaller(req), auditContextFromRequest(req));
        res.status(201).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function listSchedulesController(req, res, next) {
    try {
        const query = req.validatedQuery ?? req.query;
        const filters = {};
        if (query.routeId !== undefined)
            filters.routeId = Number(query.routeId);
        if (query.busId !== undefined)
            filters.busId = Number(query.busId);
        if (query.status !== undefined)
            filters.status = query.status;
        if (query.date !== undefined)
            filters.date = String(query.date);
        if (query.from !== undefined)
            filters.from = String(query.from);
        if (query.to !== undefined)
            filters.to = String(query.to);
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
        const result = await updateSchedule(id, req.body, getCaller(req), auditContextFromRequest(req));
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function deleteScheduleController(req, res, next) {
    try {
        const id = Number(req.params.id);
        const query = req.validatedQuery ?? req.query;
        const scope = query.scope ?? "this";
        const result = await deleteSchedule(id, getCaller(req), scope);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=controller.js.map