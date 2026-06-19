import Joi from "joi";

export const updateSeatStatusSchema = {
  body: Joi.object({
    status: Joi.string().valid("AVAILABLE", "HELD", "BOOKED").required(),
  }),
};
