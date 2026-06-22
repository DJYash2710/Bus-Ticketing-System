import { Router } from "express";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import { getAdminBookingByIdController, getAuditLogByIdController, getLogsController, getReportsSummaryController, listAdminBookingsController, listAuditLogsController, streamLogsController, cancelScheduleController, } from "./controller.js";
import { adminSseAuthMiddleware } from "./sseAuth.middleware.js";
import { auditLogIdParamSchema, bookingIdParamSchema, listAdminBookingsSchema, listAuditLogsSchema, logsQuerySchema, reportsSummarySchema, scheduleIdParamSchema, } from "./validators.js";
const router = Router();
// EventSource cannot send Authorization headers; ?token= is a scoped exception for this route only.
router.get("/logs/stream", adminSseAuthMiddleware, requireRole(["ADMIN"]), streamLogsController);
router.use(authMiddleware);
router.get("/bookings", requireRole(["ADMIN"]), validate(listAdminBookingsSchema), listAdminBookingsController);
router.get("/bookings/:id", requireRole(["ADMIN"]), validate(bookingIdParamSchema), getAdminBookingByIdController);
router.get("/reports/summary", requireRole(["ADMIN", "OPERATOR"]), validate(reportsSummarySchema), getReportsSummaryController);
router.get("/logs", requireRole(["ADMIN"]), validate(logsQuerySchema), getLogsController);
router.get("/audit-logs", requireRole(["ADMIN"]), validate(listAuditLogsSchema), listAuditLogsController);
router.get("/audit-logs/:id", requireRole(["ADMIN"]), validate(auditLogIdParamSchema), getAuditLogByIdController);
router.patch("/schedules/:id/cancel", requireRole(["ADMIN"]), validate(scheduleIdParamSchema), cancelScheduleController);
export const adminRouter = router;
//# sourceMappingURL=routes.js.map