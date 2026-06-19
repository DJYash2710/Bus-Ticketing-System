// src/features/buses/controller.ts
import type { Request, Response, NextFunction } from "express";
import {
  createBus,
  listBuses,
  getBusById,
  updateBus,
  deleteBus,
} from "./service.js";

export async function createBusController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const bus = await createBus(req.body);
    res.status(201).json({ success: true, data: bus });
  } catch (err) {
    next(err);
  }
}

export async function listBusesController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const buses = await listBuses();
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
    const bus = await getBusById(id);
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
    const bus = await updateBus(id, req.body);
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
    const result = await deleteBus(id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
