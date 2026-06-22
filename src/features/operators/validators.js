import Joi from "joi";
const operatorUserSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(8).max(20).optional(),
    password: Joi.string().min(8).max(128).required(),
});
export const createOperatorSchema = {
    body: Joi.object({
        companyName: Joi.string().min(2).max(150).required(),
        contactEmail: Joi.string().email().optional(),
        contactPhone: Joi.string().min(8).max(20).optional(),
        operatorUser: operatorUserSchema.required(),
    }),
};
export const updateOperatorSchema = {
    body: Joi.object({
        name: Joi.string().min(2).max(150).optional(),
        contactEmail: Joi.string().email().allow(null).optional(),
        contactPhone: Joi.string().min(8).max(20).allow(null).optional(),
    }).min(1),
    params: Joi.object({
        id: Joi.number().integer().positive().required(),
    }),
};
export const operatorIdParamSchema = {
    params: Joi.object({
        id: Joi.number().integer().positive().required(),
    }),
};
//# sourceMappingURL=validators.js.map