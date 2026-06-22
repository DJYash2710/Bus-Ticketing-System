import { Router } from "express";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import {
  getAdminBookingByIdController,
  getLogsController,
  getReportsSummaryController,
  listAdminBookingsController,
} from "./controller.js";
import {
  bookingIdParamSchema,
  listAdminBookingsSchema,
  logsQuerySchema,
  reportsSummarySchema,
} from "./validators.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/bookings",
  requireRole(["ADMIN"]),
  validate(listAdminBookingsSchema),
  listAdminBookingsController,
);

router.get(
  "/bookings/:id",
  requireRole(["ADMIN"]),
  validate(bookingIdParamSchema),
  getAdminBookingByIdController,
);

router.get(
  "/reports/summary",
  requireRole(["ADMIN", "OPERATOR"]),
  validate(reportsSummarySchema),
  getReportsSummaryController,
);

router.get(
  "/logs",
  requireRole(["ADMIN"]),
  validate(logsQuerySchema),
  getLogsController,
);

export const adminRouter = router;
