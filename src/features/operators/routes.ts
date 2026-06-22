import { Router } from "express";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import {
  createOperatorController,
  getOperatorByIdController,
  listOperatorsController,
  updateOperatorController,
} from "./controller.js";
import {
  createOperatorSchema,
  operatorIdParamSchema,
  updateOperatorSchema,
} from "./validators.js";

const router = Router();

router.use(authMiddleware, requireRole(["ADMIN"]));

router.post("/", validate(createOperatorSchema), createOperatorController);
router.get("/", listOperatorsController);
router.get(
  "/:id",
  validate(operatorIdParamSchema),
  getOperatorByIdController,
);
router.patch(
  "/:id",
  validate(updateOperatorSchema),
  updateOperatorController,
);

export const operatorRouter = router;
