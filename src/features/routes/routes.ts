// src/features/routes/routes.ts
import { Router } from "express";
import {
  createRouteController,
  deleteRouteController,
  getRouteByIdController,
  listRoutesController,
  updateRouteController,
} from "./controller.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import { createRouteSchema, updateRouteSchema } from "./validators.js";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";

const router = Router();

// Authenticated users can list/filter routes
router.get("/", authMiddleware, listRoutesController);
router.get("/:id", authMiddleware, getRouteByIdController);

// Admin-only modifications
router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN"]),
  validate(createRouteSchema),
  createRouteController,
);

router.patch(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN"]),
  validate(updateRouteSchema),
  updateRouteController,
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN"]),
  deleteRouteController,
);

export const routeRouter = router;
