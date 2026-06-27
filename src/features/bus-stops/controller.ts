import type { NextFunction, Request, Response } from "express";
import {
  createBusStop,
  deleteBusStop,
  getBusStopById,
  listBusStops,
  updateBusStop,
} from "./service.js";

export async function createBusStopController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const stop = await createBusStop(req.body);
    res.status(201).json({ success: true, data: stop });
  } catch (err) {
    next(err);
  }
}

export async function listBusStopsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const cityId =
      req.query.cityId !== undefined ? Number(req.query.cityId) : undefined;
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const stops = await listBusStops(cityId, search);
    res.json({ success: true, data: stops });
  } catch (err) {
    next(err);
  }
}

export async function getBusStopByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const stop = await getBusStopById(Number(req.params.id));
    res.json({ success: true, data: stop });
  } catch (err) {
    next(err);
  }
}

export async function updateBusStopController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const stop = await updateBusStop(Number(req.params.id), req.body);
    res.json({ success: true, data: stop });
  } catch (err) {
    next(err);
  }
}

export async function deleteBusStopController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await deleteBusStop(Number(req.params.id));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
