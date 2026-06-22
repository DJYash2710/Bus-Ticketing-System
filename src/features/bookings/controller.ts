import type { NextFunction, Request, Response } from "express";
import type { AuthUser } from "../../core/middleware/auth.middleware.js";
import { requireOperatorFleetId } from "../../core/utils/operatorScope.js";
import {
  cancelBooking,
  createBooking,
  getBookingById,
  getMyBookings,
  getOperatorBookings,
} from "./service.js";
import { auditContextFromRequest } from "../../core/audit/requestContext.js";

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

    const result = await createBooking(
      {
        userId,
        scheduleId: req.body.scheduleId,
        seatNumbers: req.body.seatNumbers,
        boardingPoint: req.body.boardingPoint,
        droppingPoint: req.body.droppingPoint,
        couponCode: req.body.couponCode,
        creditsToRedeem: req.body.creditsToRedeem,
      },
      auditContextFromRequest(req),
    );

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

export async function getOperatorBookingsController(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const caller = req.user as AuthUser;
    const fleetId = requireOperatorFleetId(caller);
    const result = await getOperatorBookings(fleetId);

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

    const result = await cancelBooking(
      Number(req.params.id),
      userId,
      auditContextFromRequest(req),
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
