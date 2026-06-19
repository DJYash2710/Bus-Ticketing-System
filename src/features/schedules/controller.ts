// src/features/schedules/controller.ts
import type { Request, Response, NextFunction } from "express";
import {
  createSchedule,
  listSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
} from "./service.js";

export async function createScheduleController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const schedule = await createSchedule({
      ...req.body,
      routeId: Number(req.body.routeId),
      busId: Number(req.body.busId),
    });

    res.status(201).json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
}

export async function listSchedulesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const routeId =
      typeof req.query.routeId === "string"
        ? Number(req.query.routeId)
        : undefined;

    const busId =
      typeof req.query.busId === "string" ? Number(req.query.busId) : undefined;

    const status =
      typeof req.query.status === "string"
        ? (req.query.status as any)
        : undefined;

    const date =
      typeof req.query.date === "string" ? req.query.date : undefined;
    const filters: {
      routeId?: number;
      busId?: number;
      status?: any;
      date?: string;
    } = {};

    if (routeId !== undefined) filters.routeId = routeId;
    if (busId !== undefined) filters.busId = busId;
    if (status !== undefined) filters.status = status;
    if (date !== undefined) filters.date = date;

    const schedules = await listSchedules(filters);

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
    const schedule = await getScheduleById(id);
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
    const schedule = await updateSchedule(id, req.body);
    res.json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
}

export async function deleteScheduleController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const result = await deleteSchedule(id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
