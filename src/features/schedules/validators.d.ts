import type { NextFunction, Request, Response } from "express";
import Joi from "joi";
export declare const ROUTE_DURATION_REQUIRED_MSG = "This route has no duration set. Add one in Routes before scheduling trips on it.";
/** Ensures the route referenced in a create-schedule body has estimatedDurationMinutes set. */
export declare function validateScheduleRouteDuration(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare const listSchedulesSchema: {
    query: Joi.ObjectSchema<any>;
};
export declare const createScheduleSchema: {
    body: Joi.ObjectSchema<any>;
};
export declare const updateScheduleSchema: {
    body: Joi.ObjectSchema<any>;
};
export declare const deleteScheduleSchema: {
    query: Joi.ObjectSchema<any>;
};
export declare const scheduleIdParamSchema: {
    params: Joi.ObjectSchema<any>;
};
//# sourceMappingURL=validators.d.ts.map