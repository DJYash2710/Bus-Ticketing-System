// src/features/schedules/routes.ts
import { Router } from "express";
import {
  createScheduleController,
  deleteScheduleController,
  getScheduleByIdController,
  listSchedulesController,
  updateScheduleController,
} from "./controller.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import { createScheduleSchema, updateScheduleSchema } from "./validators.js";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";

const router = Router();

router.get("/", authMiddleware, listSchedulesController);
router.get("/:id", authMiddleware, getScheduleByIdController);

router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN"]),
  validate(createScheduleSchema),
  createScheduleController,
);

router.patch(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN"]),
  validate(updateScheduleSchema),
  updateScheduleController,
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN"]),
  deleteScheduleController,
);

export const scheduleRouter = router;
