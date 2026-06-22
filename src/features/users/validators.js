import Joi from "joi";
export const updateProfileSchema = {
    body: Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        phone: Joi.string().min(8).max(20).optional().allow(null),
    }).min(1),
};
export const changePasswordSchema = {
    body: Joi.object({
        currentPassword: Joi.string().min(8).max(128).required(),
        newPassword: Joi.string().min(8).max(128).required(),
    }),
};
//# sourceMappingURL=validators.js.map