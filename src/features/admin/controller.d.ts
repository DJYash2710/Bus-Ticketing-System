import type { NextFunction, Request, Response } from "express";
type ValidatedQueryRequest = Request & {
    validatedQuery?: Record<string, unknown>;
};
export declare function listAdminBookingsController(req: ValidatedQueryRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getAdminBookingByIdController(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getReportsSummaryController(req: ValidatedQueryRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getLogsController(req: ValidatedQueryRequest, res: Response, next: NextFunction): Promise<void>;
export {};
//# sourceMappingURL=controller.d.ts.map