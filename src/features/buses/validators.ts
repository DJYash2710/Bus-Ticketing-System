// src/features/buses/validators.ts
import Joi from "joi";

const busTypeEnum = [
  "SEATER",
  "SLEEPER",
  "SEMI_SLEEPER",
  "AC",
  "NON_AC",
] as const;

export const createBusSchema = {
  body: Joi.object({
    registrationNo: Joi.string().min(3).max(50).required(),
    name: Joi.string().min(2).max(100).required(),
    capacity: Joi.number().integer().min(1).max(100).required(),
    type: Joi.string()
      .valid(...busTypeEnum)
      .required(),
    amenities: Joi.array().items(Joi.string()).optional(), // we’ll store as CSV or JSON string
    operatorId: Joi.number().integer().optional().allow(null),
  }),
};

export const updateBusSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    capacity: Joi.number().integer().min(1).max(100).optional(),
    type: Joi.string()
      .valid(...busTypeEnum)
      .optional(),
    amenities: Joi.array().items(Joi.string()).optional(),
    operatorId: Joi.number().integer().optional().allow(null),
  }).min(1), // at least one field
};
