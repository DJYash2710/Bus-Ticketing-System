import Joi from "joi";
import { BookingStatus, PaymentStatus } from "@prisma/client";
export const listAdminBookingsSchema = {
    query: Joi.object({
        status: Joi.string()
            .valid(...Object.values(BookingStatus))
            .optional(),
        paymentStatus: Joi.string()
            .valid(...Object.values(PaymentStatus))
            .optional(),
        userId: Joi.number().integer().positive().optional(),
        fromDate: Joi.string().isoDate().optional(),
        toDate: Joi.string().isoDate().optional(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
    }),
};
export const bookingIdParamSchema = {
    params: Joi.object({
        id: Joi.number().integer().positive().required(),
    }),
};
export const reportsSummarySchema = {
    query: Joi.object({
        fromDate: Joi.string().isoDate().optional(),
        toDate: Joi.string().isoDate().optional(),
    }),
};
export const logsQuerySchema = {
    query: Joi.object({
        lines: Joi.number().integer().min(1).max(500).default(100),
    }),
};
//# sourceMappingURL=validators.js.map