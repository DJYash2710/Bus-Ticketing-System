import type { NextFunction, Request, Response } from "express";
type AuthRequest = Request & {
    user?: {
        id: number;
        name?: string;
        email?: string;
        role?: string;
    };
};
export declare function createBookingController(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getBookingByIdController(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getMyBookingsController(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getOperatorBookingsController(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function cancelBookingController(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=controller.d.ts.map