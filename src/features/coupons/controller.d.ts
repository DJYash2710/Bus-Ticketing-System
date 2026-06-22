import type { NextFunction, Request, Response } from "express";
type ValidatedQueryRequest = Request & {
    user?: {
        id: number;
    };
    validatedQuery?: Record<string, unknown>;
};
export declare function validateCouponController(req: ValidatedQueryRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function listCouponsController(_req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createCouponController(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateCouponController(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteCouponController(req: Request, res: Response, next: NextFunction): Promise<void>;
export {};
//# sourceMappingURL=controller.d.ts.map