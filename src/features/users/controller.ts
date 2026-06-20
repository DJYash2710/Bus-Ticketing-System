import type { NextFunction, Request, Response } from "express";
import {
  changeUserPassword,
  getUserProfile,
  updateUserProfile,
} from "./service.js";

type AuthRequest = Request & { user?: { id: number } };

export async function getProfileController(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await getUserProfile(userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateProfileController(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await updateUserProfile(userId, req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function changePasswordController(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await changeUserPassword(userId, req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
