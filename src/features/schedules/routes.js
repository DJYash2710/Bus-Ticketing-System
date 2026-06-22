// src/features/schedules/routes.ts
import { Router } from "express";
import { createScheduleController, deleteScheduleController, getScheduleByIdController, listSchedulesController, updateScheduleController, } from "./controller.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import { createScheduleSchema, deleteScheduleSchema, listSchedulesSchema, scheduleIdParamSchema, updateScheduleSchema, validateScheduleRouteDuration, } from "./validators.js";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
const router = Router();
router.get("/", authMiddleware, validate(listSchedulesSchema), listSchedulesController);
router.get("/:id", authMiddleware, validate(scheduleIdParamSchema), getScheduleByIdController);
router.post("/", authMiddleware, requireRole(["ADMIN", "OPERATOR"]), validate(createScheduleSchema), validateScheduleRouteDuration, createScheduleController);
router.patch("/:id", authMiddleware, requireRole(["ADMIN", "OPERATOR"]), validate({ ...updateScheduleSchema, params: scheduleIdParamSchema.params }), updateScheduleController);
router.delete("/:id", authMiddleware, requireRole(["ADMIN", "OPERATOR"]), validate({
    params: scheduleIdParamSchema.params,
    query: deleteScheduleSchema.query,
}), deleteScheduleController);
export const scheduleRouter = router;
//# sourceMappingURL=routes.js.map