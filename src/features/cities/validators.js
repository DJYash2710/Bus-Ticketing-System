// src/features/cities/validators.ts
import Joi from "joi";
export const createCitySchema = {
    body: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        state: Joi.string().min(2).max(100).optional().allow(null, ""),
        country: Joi.string()
            .min(2)
            .max(100)
            .optional()
            .allow(null, "")
            .default("India"),
    }),
};
export const updateCitySchema = {
    body: Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        state: Joi.string().min(2).max(100).optional().allow(null, ""),
        country: Joi.string().min(2).max(100).optional().allow(null, ""),
    }).min(1),
};
//# sourceMappingURL=validators.js.map