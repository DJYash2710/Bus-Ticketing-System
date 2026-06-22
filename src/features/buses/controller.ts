// src/features/buses/controller.ts
import type { Request, Response, NextFunction } from "express";
import type { AuthUser } from "../../core/middleware/auth.middleware.js";
import {
  createBus,
  listBuses,
  getBusById,
  updateBus,
  deleteBus,
} from "./service.js";

function getCaller(req: Request): AuthUser {
  return req.user as AuthUser;
}

export async function createBusController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const bus = await createBus(req.body, getCaller(req));
    res.status(201).json({ success: true, data: bus });
  } catch (err) {
    next(err);
  }
}

export async function listBusesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const buses = await listBuses(getCaller(req));
    res.json({ success: true, data: buses });
  } catch (err) {
    next(err);
  }
}

export async function getBusByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const bus = await getBusById(id, getCaller(req));
    res.json({ success: true, data: bus });
  } catch (err) {
    next(err);
  }
}

export async function updateBusController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const bus = await updateBus(id, req.body, getCaller(req));
    res.json({ success: true, data: bus });
  } catch (err) {
    next(err);
  }
}

export async function deleteBusController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const result = await deleteBus(id, getCaller(req));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
