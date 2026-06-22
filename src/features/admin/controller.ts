import type { NextFunction, Request, Response } from "express";
import type { AuthUser } from "../../core/middleware/auth.middleware.js";
import { requireOperatorFleetId } from "../../core/utils/operatorScope.js";
import {
  getAdminBookingById,
  getReportsSummary,
  listAdminBookings,
} from "./service.js";
import { readRecentLogs } from "./logs.service.js";
import { getAuditLogById, listAuditLogs } from "./audit.service.js";
import { logEmitter } from "../../config/logEmitter.js";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { cancelScheduleCascade } from "../schedules/cancelCascade.js";
import { auditContextFromRequest } from "../../core/audit/requestContext.js";

type ValidatedQueryRequest = Request & {
  validatedQuery?: Record<string, unknown>;
};

export async function listAdminBookingsController(
  req: ValidatedQueryRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = req.validatedQuery ?? {};

    const result = await listAdminBookings({
      status: query.status as BookingStatus | undefined,
      paymentStatus: query.paymentStatus as PaymentStatus | undefined,
      userId: query.userId as number | undefined,
      fromDate: query.fromDate as string | undefined,
      toDate: query.toDate as string | undefined,
      page: (query.page as number) ?? 1,
      limit: (query.limit as number) ?? 20,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getAdminBookingByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getAdminBookingById(Number(req.params.id));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getReportsSummaryController(
  req: ValidatedQueryRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = req.validatedQuery ?? {};
    const caller = req.user as AuthUser;

    const busOperatorId =
      caller.role === "OPERATOR"
        ? requireOperatorFleetId(caller)
        : undefined;

    const input: {
      fromDate?: string;
      toDate?: string;
      busOperatorId?: number;
    } = {};

    if (query.fromDate) input.fromDate = query.fromDate as string;
    if (query.toDate) input.toDate = query.toDate as string;
    if (busOperatorId !== undefined) input.busOperatorId = busOperatorId;

    const result = await getReportsSummary(input);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getLogsController(
  req: ValidatedQueryRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = req.validatedQuery ?? {};
    const lines = (query.lines as number) ?? 100;
    const result = await readRecentLogs(lines);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export function streamLogsController(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const onLog = (entry: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(entry)}\n\n`);
  };

  logEmitter.on("log", onLog);

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 30_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    logEmitter.off("log", onLog);
  });
}

export async function listAuditLogsController(
  req: ValidatedQueryRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = req.validatedQuery ?? {};

    const listInput: {
      page: number;
      limit: number;
      action?: string;
      actorId?: number;
      entityType?: string;
      fromDate?: string;
      toDate?: string;
    } = {
      page: (query.page as number) ?? 1,
      limit: (query.limit as number) ?? 20,
    };

    if (query.action) listInput.action = query.action as string;
    if (query.actorId !== undefined) listInput.actorId = query.actorId as number;
    if (query.entityType) listInput.entityType = query.entityType as string;
    if (query.fromDate) listInput.fromDate = query.fromDate as string;
    if (query.toDate) listInput.toDate = query.toDate as string;

    const result = await listAuditLogs(listInput);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getAuditLogById(Number(req.params.id));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function cancelScheduleController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await cancelScheduleCascade(
      Number(req.params.id),
      auditContextFromRequest(req),
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
