import { Router } from "express";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { strictRateLimiter } from "../../core/middleware/rateLimit.middleware.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import {
  cancelBookingController,
  createBookingController,
  getBookingByIdController,
  getMyBookingsController,
  getOperatorBookingsController,
} from "./controller.js";
import { bookingIdParamSchema, createBookingSchema } from "./validators.js";

const router = Router();

router.use(authMiddleware);

router.post("/", strictRateLimiter, validate(createBookingSchema), createBookingController);
router.get("/my-bookings", getMyBookingsController);
router.get(
  "/operator/bookings",
  requireRole(["OPERATOR"]),
  getOperatorBookingsController,
);
router.get("/:id", validate(bookingIdParamSchema), getBookingByIdController);
router.patch(
  "/:id/cancel",
  validate(bookingIdParamSchema),
  cancelBookingController,
);

export const bookingRouter = router;
