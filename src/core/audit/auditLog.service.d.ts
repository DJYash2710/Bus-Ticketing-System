import type { AuditContext } from "./requestContext.js";
export type AuditLogInput = {
    actorId?: number | null;
    actorRole?: string | null;
    action: string;
    entityType: string;
    entityId?: number | null;
    metadata?: Record<string, unknown> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
};
/** Fire-and-forget audit write; never throws to callers. */
export declare function auditLog(input: AuditLogInput): void;
export declare function auditLogFrom(ctx: AuditContext, event: Omit<AuditLogInput, "actorId" | "actorRole" | "ipAddress" | "userAgent">): void;
//# sourceMappingURL=auditLog.service.d.ts.map