import type { NextFunction, Request, Response } from "express";
export type AuthUser = {
    id: number;
    role: string;
    busOperatorId?: number | null;
};
declare module "express-serve-static-core" {
    interface Request {
        user?: AuthUser;
    }
}
export declare function authMiddleware(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.middleware.d.ts.map