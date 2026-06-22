import { requireOperatorFleetId } from "../../core/utils/operatorScope.js";
import { getAdminBookingById, getReportsSummary, listAdminBookings, } from "./service.js";
import { readRecentLogs } from "./logs.service.js";
import { BookingStatus, PaymentStatus } from "@prisma/client";
export async function listAdminBookingsController(req, res, next) {
    try {
        const query = req.validatedQuery ?? {};
        const result = await listAdminBookings({
            status: query.status,
            paymentStatus: query.paymentStatus,
            userId: query.userId,
            fromDate: query.fromDate,
            toDate: query.toDate,
            page: query.page ?? 1,
            limit: query.limit ?? 20,
        });
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function getAdminBookingByIdController(req, res, next) {
    try {
        const result = await getAdminBookingById(Number(req.params.id));
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function getReportsSummaryController(req, res, next) {
    try {
        const query = req.validatedQuery ?? {};
        const caller = req.user;
        const busOperatorId = caller.role === "OPERATOR"
            ? requireOperatorFleetId(caller)
            : undefined;
        const input = {};
        if (query.fromDate)
            input.fromDate = query.fromDate;
        if (query.toDate)
            input.toDate = query.toDate;
        if (busOperatorId !== undefined)
            input.busOperatorId = busOperatorId;
        const result = await getReportsSummary(input);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function getLogsController(req, res, next) {
    try {
        const query = req.validatedQuery ?? {};
        const lines = query.lines ?? 100;
        const result = await readRecentLogs(lines);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=controller.js.map