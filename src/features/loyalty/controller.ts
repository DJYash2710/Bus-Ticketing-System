import type { NextFunction, Request, Response } from "express";
import { getLoyaltyHistory, getLoyaltySummary } from "./service.js";

type AuthRequest = Request & { user?: { id: number } };

export async function getLoyaltySummaryController(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await getLoyaltySummary(userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getLoyaltyHistoryController(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await getLoyaltyHistory(userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
