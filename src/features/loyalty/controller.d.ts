import type { NextFunction, Request, Response } from "express";
type AuthRequest = Request & {
    user?: {
        id: number;
    };
};
export declare function getLoyaltySummaryController(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getLoyaltyHistoryController(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=controller.d.ts.map