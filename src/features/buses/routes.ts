// src/features/buses/routes.ts
import { Router } from "express";
import {
  createBusController,
  deleteBusController,
  getBusByIdController,
  listBusesController,
  updateBusController,
} from "./controller.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import { createBusSchema, updateBusSchema } from "./validators.js";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";

const router = Router();

// Public or authenticated list? For now require auth but any role can view
router.get("/", authMiddleware, listBusesController);
router.get("/:id", authMiddleware, getBusByIdController);

// Admin-only modifications
router.post(
  "/",
  authMiddleware,
  requireRole(["ADMIN"]),
  validate(createBusSchema),
  createBusController,
);

router.patch(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN"]),
  validate(updateBusSchema),
  updateBusController,
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole(["ADMIN"]),
  deleteBusController,
);

export const busRouter = router;
