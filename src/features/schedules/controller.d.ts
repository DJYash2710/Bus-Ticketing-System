import type { Request, Response, NextFunction } from "express";
type ValidatedQueryRequest = Request & {
    validatedQuery?: Record<string, unknown>;
};
export declare function createScheduleController(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listSchedulesController(req: ValidatedQueryRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getScheduleByIdController(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateScheduleController(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteScheduleController(req: ValidatedQueryRequest, res: Response, next: NextFunction): Promise<void>;
export {};
//# sourceMappingURL=controller.d.ts.map