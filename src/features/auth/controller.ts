// src/features/auth/controller.ts
import type { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, refreshTokens, logoutUser } from "./service.js";

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await loginUser(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await refreshTokens(req.body.refreshToken);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.id;
    const result = await logoutUser(userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
