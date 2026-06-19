// src/features/schedules/validators.ts
import Joi from "joi";

export const createScheduleSchema = {
  body: Joi.object({
    routeId: Joi.number().integer().required(),
    busId: Joi.number().integer().required(),
    departureTime: Joi.date().iso().required(),
    arrivalTime: Joi.date().iso().optional().allow(null),
    basePrice: Joi.number().min(0).required(),
    status: Joi.string().valid("ACTIVE", "CANCELLED", "COMPLETED").optional(),
  }),
};

export const updateScheduleSchema = {
  body: Joi.object({
    departureTime: Joi.date().iso().optional(),
    arrivalTime: Joi.date().iso().optional().allow(null),
    basePrice: Joi.number().min(0).optional(),
    status: Joi.string().valid("ACTIVE", "CANCELLED", "COMPLETED").optional(),
  }).min(1),
};
