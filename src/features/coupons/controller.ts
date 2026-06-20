import type { NextFunction, Request, Response } from "express";
import {
  createCoupon,
  deleteCoupon,
  listCoupons,
  previewCoupon,
  updateCoupon,
} from "./service.js";

type AuthRequest = Request & { user?: { id: number } };
type ValidatedQueryRequest = Request & {
  user?: { id: number };
  validatedQuery?: Record<string, unknown>;
};

export async function validateCouponController(
  req: ValidatedQueryRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const query = req.validatedQuery ?? {};
    const result = await previewCoupon(
      req.params.code as string,
      userId,
      query.baseAmount as number,
    );

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listCouponsController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await listCoupons();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function createCouponController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await createCoupon(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateCouponController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await updateCoupon(Number(req.params.id), req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function deleteCouponController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await deleteCoupon(Number(req.params.id));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
