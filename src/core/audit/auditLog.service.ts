import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { logger } from "../../config/logger.js";
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

const SENSITIVE_KEY_PATTERN =
  /password|passwordhash|refreshtoken|accesstoken|token|jwt|secret|authorization/i;

function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (typeof value === "object") {
    return sanitizeMetadata(value as Record<string, unknown>);
  }

  return value;
}

function sanitizeMetadata(
  metadata: Record<string, unknown> | null | undefined,
): Prisma.InputJsonValue | undefined {
  if (!metadata) {
    return undefined;
  }

  const clean: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      continue;
    }
    clean[key] = sanitizeValue(value);
  }

  return clean as Prisma.InputJsonValue;
}

async function persistAuditLog(input: AuditLogInput): Promise<void> {
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
export function auditLog(input: AuditLogInput): void {
  void persistAuditLog(input).catch((err: unknown) => {
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

export function auditLogFrom(
  ctx: AuditContext,
  event: Omit<
    AuditLogInput,
    "actorId" | "actorRole" | "ipAddress" | "userAgent"
  >,
): void {
  auditLog({
    actorId: ctx.actorId ?? null,
    actorRole: ctx.actorRole ?? null,
    ipAddress: ctx.ipAddress ?? null,
    userAgent: ctx.userAgent ?? null,
    ...event,
  });
}
