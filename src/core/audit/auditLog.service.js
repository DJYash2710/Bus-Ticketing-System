import { prisma } from "../../config/db.js";
import { logger } from "../../config/logger.js";
const SENSITIVE_KEY_PATTERN = /password|passwordhash|refreshtoken|accesstoken|token|jwt|secret|authorization/i;
function sanitizeValue(value) {
    if (value === null || value === undefined) {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }
    if (typeof value === "object") {
        return sanitizeMetadata(value);
    }
    return value;
}
function sanitizeMetadata(metadata) {
    if (!metadata) {
        return undefined;
    }
    const clean = {};
    for (const [key, value] of Object.entries(metadata)) {
        if (SENSITIVE_KEY_PATTERN.test(key)) {
            continue;
        }
        clean[key] = sanitizeValue(value);
    }
    return clean;
}
async function persistAuditLog(input) {
    const metadata = sanitizeMetadata(input.metadata ?? undefined);
    await prisma.auditLog.create({
        data: {
            actorId: input.actorId ?? null,
            actorRole: input.actorRole ?? null,
            action: input.action,
            entityType: input.entityType,
            entityId: input.entityId ?? null,
            ...(metadata !== undefined ? { metadata } : {}),
            ipAddress: input.ipAddress ?? null,
            userAgent: input.userAgent ?? null,
        },
    });
}
/** Fire-and-forget audit write; never throws to callers. */
export function auditLog(input) {
    void persistAuditLog(input).catch((err) => {
        logger.error("Audit log write failed", {
            category: "audit",
            event: "audit_write_failed",
            action: input.action,
            entityType: input.entityType,
            entityId: input.entityId ?? null,
            message: err instanceof Error ? err.message : String(err),
        });
    });
}
export function auditLogFrom(ctx, event) {
    auditLog({
        actorId: ctx.actorId ?? null,
        actorRole: ctx.actorRole ?? null,
        ipAddress: ctx.ipAddress ?? null,
        userAgent: ctx.userAgent ?? null,
        ...event,
    });
}
//# sourceMappingURL=auditLog.service.js.map