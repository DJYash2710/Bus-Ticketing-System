import type { Request } from "express";
import type { AuthUser } from "../middleware/auth.middleware.js";
export type AuditContext = {
    actorId?: number | null;
    actorRole?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
};
export declare function auditContextFromRequest(req: Request, user?: AuthUser | null): AuditContext;
export declare function auditContextFromClient(actorId: number | null | undefined, actorRole: string | null | undefined, client: {
    ipAddress: string;
    userAgent: string;
}): AuditContext;
export declare const systemAuditContext: AuditContext;
//# sourceMappingURL=requestContext.d.ts.map