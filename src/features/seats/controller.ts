import type { Request, Response, NextFunction } from "express";
import { SeatStatus } from "@prisma/client";
import type { AuthUser } from "../../core/middleware/auth.middleware.js";
import {
  getSeatById,
  listSeatsBySchedule,
  updateSeatStatus,
} from "./service.js";
import { auditContextFromRequest } from "../../core/audit/requestContext.js";

export async function listSeatsByScheduleController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const scheduleId = Number(req.params.scheduleId);

    const status =
      typeof req.query.status === "string"
        ? (req.query.status as SeatStatus)
        : undefined;

    const filters: {
      scheduleId: number;
      status?: SeatStatus;
    } = { scheduleId };

    if (status !== undefined) {
      filters.status = status;
    }

    const result = await listSeatsBySchedule(filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSeatByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const seat = await getSeatById(id);

    res.json({
      success: true,
      data: seat,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSeatStatusController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);

    const seat = await updateSeatStatus(
      id,
      {
        status: req.body.status as SeatStatus,
      },
      req.user as AuthUser,
      auditContextFromRequest(req),
    );

    res.json({
      success: true,
      data: seat,
    });
  } catch (err) {
    next(err);
  }
}
