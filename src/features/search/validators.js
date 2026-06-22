import Joi from "joi";
export const searchSchedulesSchema = {
    query: Joi.object({
        fromCityId: Joi.number().integer().required(),
        toCityId: Joi.number().integer().required(),
        date: Joi.date().iso().required(),
    }),
};
//# sourceMappingURL=validators.js.map