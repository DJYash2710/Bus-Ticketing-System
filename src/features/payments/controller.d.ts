import type { Request, Response, NextFunction } from "express";
type AuthRequest = Request & {
    user?: {
        id: number;
    };
};
export declare function initiatePaymentController(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function confirmPaymentController(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getPaymentController(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export {};
//# sourceMappingURL=controller.d.ts.map