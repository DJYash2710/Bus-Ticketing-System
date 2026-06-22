import Joi from "joi";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
export const ROUTE_DURATION_REQUIRED_MSG = "This route has no duration set. Add one in Routes before scheduling trips on it.";
/** Ensures the route referenced in a create-schedule body has estimatedDurationMinutes set. */
export async function validateScheduleRouteDuration(req, _res, next) {
    try {
        const routeId = Number(req.body.routeId);
        const route = await prisma.route.findUnique({ where: { id: routeId } });
        if (!route)
            throw new ApiError(404, "Route not found");
        if (route.estimatedDurationMinutes == null) {
            throw new ApiError(400, ROUTE_DURATION_REQUIRED_MSG);
        }
        next();
    }
    catch (err) {
        next(err);
    }
}
const recurrenceSchema = Joi.object({
    frequency: Joi.string().valid("DAILY", "WEEKLY", "MONTHLY").required(),
    daysOfWeek: Joi.array().items(Joi.number().integer().min(0).max(6)).optional(),
    endDate: Joi.date().iso().required(),
});
const scopeSchema = Joi.string().valid("this", "following", "all");
export const listSchedulesSchema = {
    query: Joi.object({
        routeId: Joi.number().integer().optional(),
        busId: Joi.number().integer().optional(),
        status: Joi.string().valid("ACTIVE", "CANCELLED", "COMPLETED").optional(),
        date: Joi.string().isoDate().optional(),
        from: Joi.string().isoDate().optional(),
        to: Joi.string().isoDate().optional(),
    }),
};
export const createScheduleSchema = {
    body: Joi.object({
        routeId: Joi.number().integer().required(),
        busId: Joi.number().integer().required(),
        departureTime: Joi.date().iso().required(),
        arrivalTime: Joi.date().iso().optional().allow(null),
        basePrice: Joi.number().min(0).required(),
        status: Joi.string().valid("ACTIVE", "CANCELLED", "COMPLETED").optional(),
        color: Joi.string()
            .pattern(/^#[0-9A-Fa-f]{6}$/)
            .optional(),
        recurrence: recurrenceSchema.optional(),
    }),
};
export const updateScheduleSchema = {
    body: Joi.object({
        departureTime: Joi.date().iso().optional(),
        arrivalTime: Joi.date().iso().optional().allow(null),
        basePrice: Joi.number().min(0).optional(),
        status: Joi.string().valid("ACTIVE", "CANCELLED", "COMPLETED").optional(),
        color: Joi.string()
            .pattern(/^#[0-9A-Fa-f]{6}$/)
            .optional(),
        scope: scopeSchema.optional().default("this"),
    }).min(1),
};
export const deleteScheduleSchema = {
    query: Joi.object({
        scope: scopeSchema.optional().default("this"),
    }),
};
export const scheduleIdParamSchema = {
    params: Joi.object({
        id: Joi.number().integer().required(),
    }),
};
//# sourceMappingURL=validators.js.map