import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";

export type ListAuditLogsInput = {
  page?: number;
  limit?: number;
  action?: string;
  actorId?: number;
  entityType?: string;
  fromDate?: string;
  toDate?: string;
};

function buildDateRange(fromDate?: string, toDate?: string) {
  if (!fromDate && !toDate) {
    return undefined;
  }

  const range: { gte?: Date; lte?: Date } = {};

  if (fromDate) {
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);
    range.gte = start;
  }

  if (toDate) {
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    range.lte = end;
  }

  return range;
}

export async function listAuditLogs(input: ListAuditLogsInput) {
  const page = input.page ?? 1;
  const limit = input.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.AuditLogWhereInput = {};

  if (input.action) {
    where.action = input.action;
  }

  if (input.actorId !== undefined) {
    where.actorId = input.actorId;
  }

  if (input.entityType) {
    where.entityType = input.entityType;
  }

  const createdAt = buildDateRange(input.fromDate, input.toDate);
  if (createdAt) {
    where.createdAt = createdAt;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getAuditLogById(id: number) {
  const log = await prisma.auditLog.findUnique({ where: { id } });

  if (!log) {
    throw new ApiError(404, "Audit log not found");
  }

  return log;
}
