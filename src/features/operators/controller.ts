import type { NextFunction, Request, Response } from "express";
import {
  createOperator,
  getOperatorById,
  listOperators,
  updateOperator,
} from "./service.js";

export async function createOperatorController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await createOperator(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listOperatorsController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const operators = await listOperators();
    res.json({ success: true, data: operators });
  } catch (err) {
    next(err);
  }
}

export async function getOperatorByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const operator = await getOperatorById(Number(req.params.id));
    res.json({ success: true, data: operator });
  } catch (err) {
    next(err);
  }
}

export async function updateOperatorController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const operator = await updateOperator(Number(req.params.id), req.body);
    res.json({ success: true, data: operator });
  } catch (err) {
    next(err);
  }
}
