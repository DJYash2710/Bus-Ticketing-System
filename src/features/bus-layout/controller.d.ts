import type { Request, Response, NextFunction } from 'express';
type AuthRequest = Request & {
    user?: {
        id: number;
        role: string;
    };
};
export declare function getBusLayoutController(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function saveBusLayoutController(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function applyBusLayoutTemplateController(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function regenerateBusLayoutController(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function listBusLayoutVersionsController(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getBusLayoutVersionController(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function restoreBusLayoutVersionController(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export {};
//# sourceMappingURL=controller.d.ts.map