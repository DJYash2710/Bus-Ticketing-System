import { Router } from "express";
import {
  getSeatByIdController,
  listSeatsByScheduleController,
  updateSeatStatusController,
} from "./controller.js";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import { updateSeatStatusSchema } from "./validators.js";

const router = Router();

// Authenticated users can see seat map of a schedule
router.get(
  "/schedule/:scheduleId",
  authMiddleware,
  listSeatsByScheduleController,
);

// Authenticated users can inspect a single seat
router.get("/:id", authMiddleware, getSeatByIdController);

// Admin-only seat status override
router.patch(
  "/:id/status",
  authMiddleware,
  requireRole(["ADMIN"]),
  validate(updateSeatStatusSchema),
  updateSeatStatusController,
);

export const seatRouter = router;
