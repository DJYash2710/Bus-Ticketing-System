import { Router } from "express";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import {
  createBusStopController,
  deleteBusStopController,
  getBusStopByIdController,
  listBusStopsController,
  updateBusStopController,
} from "./controller.js";
import {
  busStopIdParamSchema,
  createBusStopSchema,
  listBusStopsSchema,
  updateBusStopSchema,
} from "./validators.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  validate(listBusStopsSchema),
  listBusStopsController,
);
router.get(
  "/:id",
  authMiddleware,
  validate(busStopIdParamSchema),
  getBusStopByIdController,
);

router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN", "OPERATOR"]),
  validate(createBusStopSchema),
  createBusStopController,
);

router.patch(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN", "OPERATOR"]),
  validate(updateBusStopSchema),
  updateBusStopController,
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN", "OPERATOR"]),
  validate(busStopIdParamSchema),
  deleteBusStopController,
);

export const busStopRouter = router;
