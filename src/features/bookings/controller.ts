import type { NextFunction, Request, Response } from "express";
import {
  cancelBooking,
  createBooking,
  getBookingById,
  getMyBookings,
} from "./service.js";

type AuthRequest = Request & {
  user?: {
    id: number;
    name?: string;
    email?: string;
    role?: string;
  };
};

export async function createBookingController(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await createBooking({
      userId,
      scheduleId: req.body.scheduleId,
      seatNumbers: req.body.seatNumbers,
      boardingPoint: req.body.boardingPoint,
      droppingPoint: req.body.droppingPoint,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getBookingByIdController(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await getBookingById(Number(req.params.id), userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyBookingsController(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await getMyBookings(userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function cancelBookingController(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await cancelBooking(Number(req.params.id), userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
