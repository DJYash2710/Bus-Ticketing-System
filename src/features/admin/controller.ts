import type { NextFunction, Request, Response } from "express";
import type { AuthUser } from "../../core/middleware/auth.middleware.js";
import { requireOperatorFleetId } from "../../core/utils/operatorScope.js";
import {
  getAdminBookingById,
  getReportsSummary,
  listAdminBookings,
} from "./service.js";
import { readRecentLogs } from "./logs.service.js";
import { BookingStatus, PaymentStatus } from "@prisma/client";

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
