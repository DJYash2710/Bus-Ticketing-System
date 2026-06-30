// src/features/buses/validators.ts
import Joi from "joi";
const bodyTypeEnum = ["SEATER", "SLEEPER", "SEMI_SLEEPER"];
const layoutTypeEnum = ["SEATER_2_2", "SEATER_2_1", "SLEEPER_1_1"];
const legacyTypeEnum = [
    "SEATER",
    "SLEEPER",
    "SEMI_SLEEPER",
    "AC",
    "NON_AC",
];
const busTypeFields = {
    bodyType: Joi.string().valid(...bodyTypeEnum),
    layoutType: Joi.string().valid(...layoutTypeEnum),
    hasAc: Joi.boolean(),
    type: Joi.string().valid(...legacyTypeEnum),
};
export const createBusSchema = {
    body: Joi.object({
        registrationNo: Joi.string().min(3).max(50).required(),
        name: Joi.string().min(2).max(100).required(),
        capacity: Joi.number().integer().min(1).max(100).required(),
        ...busTypeFields,
        amenities: Joi.array().items(Joi.string()).optional(),
        operatorId: Joi.number().integer().optional().allow(null),
    })
        .or("bodyType", "type")
        .messages({
        "object.missing": "Provide bodyType or legacy type",
    }),
};
export const updateBusSchema = {
    body: Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        capacity: Joi.number().integer().min(1).max(100).optional(),
        ...busTypeFields,
        amenities: Joi.array().items(Joi.string()).optional(),
        operatorId: Joi.number().integer().optional().allow(null),
    }).min(1),
};
//# sourceMappingURL=validators.js.map