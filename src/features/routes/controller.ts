// src/features/routes/controller.ts
import type { Request, Response, NextFunction } from "express";
import {
  createRoute,
  deleteRoute,
  getRouteById,
  listRoutes,
  updateRoute,
} from "./service.js";
import { auditContextFromRequest } from "../../core/audit/requestContext.js";

export async function createRouteController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const route = await createRoute(
      {
        ...req.body,
        fromCityId: Number(req.body.fromCityId),
        toCityId: Number(req.body.toCityId),
      },
      auditContextFromRequest(req),
    );
    res.status(201).json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
}

export async function listRoutesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const fromCityId =
      typeof req.query.fromCityId === "string"
        ? Number(req.query.fromCityId)
        : undefined;
    const toCityId =
      typeof req.query.toCityId === "string"
        ? Number(req.query.toCityId)
        : undefined;

    const routes = await listRoutes(fromCityId, toCityId);
    res.json({ success: true, data: routes });
  } catch (err) {
    next(err);
  }
}

export async function getRouteByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const route = await getRouteById(id);
    res.json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
}

export async function updateRouteController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const route = await updateRoute(
      id,
      req.body,
      auditContextFromRequest(req),
    );
    res.json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
}

export async function deleteRouteController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const result = await deleteRoute(id, auditContextFromRequest(req));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
