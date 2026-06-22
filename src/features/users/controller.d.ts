import type { NextFunction, Request, Response } from "express";
type AuthRequest = Request & {
    user?: {
        id: number;
    };
};
export declare function getProfileController(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateProfileController(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function changePasswordController(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=controller.d.ts.map