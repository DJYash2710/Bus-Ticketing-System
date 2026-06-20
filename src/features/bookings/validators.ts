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
    couponCode: Joi.string().trim().uppercase().optional(),
    creditsToRedeem: Joi.number().integer().min(0).optional(),
  }),
};

export const bookingIdParamSchema = {
  params: Joi.object({
    id: Joi.number().integer().required(),
  }),
};
