import type { NextFunction, Request, Response } from "express";
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

    const result = await getReportsSummary({
      fromDate: query.fromDate as string | undefined,
      toDate: query.toDate as string | undefined,
    });

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
