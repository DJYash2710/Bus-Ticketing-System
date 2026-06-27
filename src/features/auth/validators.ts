// src/features/auth/validators.ts
import Joi from "joi";

export const registerSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\d{10}$/).optional().messages({
      'string.pattern.base': 'Phone must be exactly 10 digits',
    }),
    password: Joi.string().min(8).max(128).required(),
    referralCode: Joi.string()
      .trim()
      .uppercase()
      .allow(null, '')
      .empty('')
      .optional(),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
  }),
};

export const refreshSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};
