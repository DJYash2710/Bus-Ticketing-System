// src/features/routes/validators.ts
import Joi from "joi";
export const createRouteSchema = {
    body: Joi.object({
        code: Joi.string().min(2).max(50).required(),
        fromCityId: Joi.number().integer().required(),
        toCityId: Joi.number().integer().required(),
        distanceKm: Joi.number().integer().min(1).optional(),
        durationMin: Joi.number().integer().min(1).optional(),
    }),
};
export const updateRouteSchema = {
    body: Joi.object({
        distanceKm: Joi.number().integer().min(1).optional(),
        durationMin: Joi.number().integer().min(1).optional(),
    }).min(1),
};
//# sourceMappingURL=validators.js.map