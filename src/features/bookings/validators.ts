import Joi from "joi";

export const createBookingSchema = {
  body: Joi.object({
    scheduleId: Joi.number().integer().required(),
    seatNumbers: Joi.array()
      .items(Joi.string().trim().min(1))
      .min(1)
      .required(),
    boardingPoint: Joi.string().trim().min(2).required(),
    droppingPoint: Joi.string().trim().min(2).required(),
  }),
};

export const bookingIdParamSchema = {
  params: Joi.object({
    id: Joi.number().integer().required(),
  }),
};
