// src/features/schedules/controller.ts
import type { Request, Response, NextFunction } from "express";
import type { AuthUser } from "../../core/middleware/auth.middleware.js";
import {
  createSchedule,
  listSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  type ScheduleScope,
} from "./service.js";

type ValidatedQueryRequest = Request & {
  validatedQuery?: Record<string, unknown>;
};

function getCaller(req: Request): AuthUser {
  return req.user as AuthUser;
}

export async function createScheduleController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await createSchedule(
      {
        ...req.body,
        routeId: Number(req.body.routeId),
        busId: Number(req.body.busId),
      },
      getCaller(req),
    );

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listSchedulesController(
  req: ValidatedQueryRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = req.validatedQuery ?? req.query;

    const filters: {
      routeId?: number;
      busId?: number;
      status?: any;
      date?: string;
      from?: string;
      to?: string;
    } = {};

    if (query.routeId !== undefined) filters.routeId = Number(query.routeId);
    if (query.busId !== undefined) filters.busId = Number(query.busId);
    if (query.status !== undefined) filters.status = query.status;
    if (query.date !== undefined) filters.date = String(query.date);
    if (query.from !== undefined) filters.from = String(query.from);
    if (query.to !== undefined) filters.to = String(query.to);

    const schedules = await listSchedules(filters, getCaller(req));

    res.json({ success: true, data: schedules });
  } catch (err) {
    next(err);
  }
}

export async function getScheduleByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const schedule = await getScheduleById(id, getCaller(req));
    res.json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
}

export async function updateScheduleController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const result = await updateSchedule(id, req.body, getCaller(req));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function deleteScheduleController(
  req: ValidatedQueryRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const query = req.validatedQuery ?? req.query;
    const scope = (query.scope as ScheduleScope | undefined) ?? "this";
    const result = await deleteSchedule(id, getCaller(req), scope);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
