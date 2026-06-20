import Joi from "joi";
import { CouponType } from "@prisma/client";

export const validateCouponSchema = {
  params: Joi.object({
    code: Joi.string().trim().uppercase().required(),
  }),
  query: Joi.object({
    baseAmount: Joi.number().positive().required(),
  }),
};

export const createCouponSchema = {
  body: Joi.object({
    code: Joi.string().trim().uppercase().min(3).max(30).required(),
    type: Joi.string()
      .valid(...Object.values(CouponType))
      .required(),
    value: Joi.number().positive().required(),
    maxUsesPerUser: Joi.number().integer().min(1).optional().allow(null),
    maxGlobalUses: Joi.number().integer().min(1).optional().allow(null),
    isActive: Joi.boolean().default(true),
    validFrom: Joi.date().iso().optional().allow(null),
    validTo: Joi.date().iso().optional().allow(null),
  }),
};

export const updateCouponSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object({
    type: Joi.string()
      .valid(...Object.values(CouponType))
      .optional(),
    value: Joi.number().positive().optional(),
    maxUsesPerUser: Joi.number().integer().min(1).optional().allow(null),
    maxGlobalUses: Joi.number().integer().min(1).optional().allow(null),
    isActive: Joi.boolean().optional(),
    validFrom: Joi.date().iso().optional().allow(null),
    validTo: Joi.date().iso().optional().allow(null),
  }).min(1),
};

export const couponIdParamSchema = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};
