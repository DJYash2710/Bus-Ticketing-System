import Joi from "joi";
export const createBusStopSchema = {
    body: Joi.object({
        name: Joi.string().trim().min(2).max(120).required(),
        locality: Joi.string().trim().min(2).max(120).required(),
        cityId: Joi.number().integer().positive().required(),
    }),
};
export const updateBusStopSchema = {
    body: Joi.object({
        name: Joi.string().trim().min(2).max(120).optional(),
        locality: Joi.string().trim().min(2).max(120).optional(),
        cityId: Joi.number().integer().positive().optional(),
    }).min(1),
};
export const listBusStopsSchema = {
    query: Joi.object({
        cityId: Joi.number().integer().positive().optional(),
        search: Joi.string().trim().max(100).optional(),
    }),
};
export const busStopIdParamSchema = {
    params: Joi.object({
        id: Joi.number().integer().positive().required(),
    }),
};
//# sourceMappingURL=validators.js.map