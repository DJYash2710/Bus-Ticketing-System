// src/features/auth/controller.ts
import type { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, refreshTokens, logoutUser } from "./service.js";

function getClientMeta(req: Request) {
  return {
    userAgent: req.headers["user-agent"] ?? "unknown",
    ipAddress: req.ip ?? "unknown",
  };
}

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await registerUser(req.body, getClientMeta(req));
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
    const result = await loginUser(req.body, getClientMeta(req));
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
    const result = await refreshTokens(
      req.body.refreshToken,
      getClientMeta(req),
    );
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
    const result = await logoutUser(userId, req.ip ?? "unknown");
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
