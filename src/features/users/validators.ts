import Joi from "joi";

export const updateProfileSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^\d{10}$/).optional().allow(null).messages({
      'string.pattern.base': 'Phone must be exactly 10 digits',
    }),
  }).min(1),
};

export const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().min(8).max(128).required(),
    newPassword: Joi.string().min(8).max(128).required(),
  }),
};
