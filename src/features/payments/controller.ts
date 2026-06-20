import type { Request, Response, NextFunction } from "express";
import { initiatePayment, confirmPayment, getPaymentByBookingId } from "./service.js";

type AuthRequest = Request & { user?: { id: number } };

export async function initiatePaymentController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const bookingId = Number(req.params.bookingId);
    const result = await initiatePayment(bookingId, userId);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function confirmPaymentController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const paymentId = Number(req.params.paymentId);
    const result = await confirmPayment(paymentId, userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getPaymentController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const bookingId = Number(req.params.bookingId);
    const result = await getPaymentByBookingId(bookingId, userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}