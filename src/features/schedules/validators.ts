// src/features/schedules/validators.ts
import Joi from "joi";

const recurrenceSchema = Joi.object({
  frequency: Joi.string().valid("DAILY", "WEEKLY", "MONTHLY").required(),
  daysOfWeek: Joi.array().items(Joi.number().integer().min(0).max(6)).optional(),
  endDate: Joi.date().iso().required(),
});

const scopeSchema = Joi.string().valid("this", "following", "all");

export const listSchedulesSchema = {
  query: Joi.object({
    routeId: Joi.number().integer().optional(),
    busId: Joi.number().integer().optional(),
    status: Joi.string().valid("ACTIVE", "CANCELLED", "COMPLETED").optional(),
    date: Joi.string().isoDate().optional(),
    from: Joi.string().isoDate().optional(),
    to: Joi.string().isoDate().optional(),
  }),
};

export const createScheduleSchema = {
  body: Joi.object({
    routeId: Joi.number().integer().required(),
    busId: Joi.number().integer().required(),
    departureTime: Joi.date().iso().required(),
    arrivalTime: Joi.date().iso().optional().allow(null),
    basePrice: Joi.number().min(0).required(),
    status: Joi.string().valid("ACTIVE", "CANCELLED", "COMPLETED").optional(),
    color: Joi.string()
      .pattern(/^#[0-9A-Fa-f]{6}$/)
      .optional(),
    recurrence: recurrenceSchema.optional(),
  }),
};

export const updateScheduleSchema = {
  body: Joi.object({
    departureTime: Joi.date().iso().optional(),
    arrivalTime: Joi.date().iso().optional().allow(null),
    basePrice: Joi.number().min(0).optional(),
    status: Joi.string().valid("ACTIVE", "CANCELLED", "COMPLETED").optional(),
    color: Joi.string()
      .pattern(/^#[0-9A-Fa-f]{6}$/)
      .optional(),
    scope: scopeSchema.optional().default("this"),
  }).min(1),
};

export const deleteScheduleSchema = {
  query: Joi.object({
    scope: scopeSchema.optional().default("this"),
  }),
};

export const scheduleIdParamSchema = {
  params: Joi.object({
    id: Joi.number().integer().required(),
  }),
};
