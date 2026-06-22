import type { Request } from "express";
import type { AuthUser } from "../middleware/auth.middleware.js";

export type AuditContext = {
  actorId?: number | null;
  actorRole?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export function auditContextFromRequest(
  req: Request,
  user?: AuthUser | null,
): AuditContext {
  const actor = user ?? req.user;
  return {
    actorId: actor?.id ?? null,
    actorRole: actor?.role ?? null,
    ipAddress: req.ip ?? null,
    userAgent:
      typeof req.headers["user-agent"] === "string"
        ? req.headers["user-agent"]
        : null,
  };
}

export function auditContextFromClient(
  actorId: number | null | undefined,
  actorRole: string | null | undefined,
  client: { ipAddress: string; userAgent: string },
): AuditContext {
  return {
    actorId: actorId ?? null,
    actorRole: actorRole ?? null,
    ipAddress: client.ipAddress,
    userAgent: client.userAgent,
  };
}

export const systemAuditContext: AuditContext = {
  actorId: null,
  actorRole: "SYSTEM",
  ipAddress: null,
  userAgent: null,
};
