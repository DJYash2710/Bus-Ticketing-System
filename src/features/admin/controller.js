import { requireOperatorFleetId } from "../../core/utils/operatorScope.js";
import { getAdminBookingById, getReportsSummary, listAdminBookings, } from "./service.js";
import { readRecentLogs } from "./logs.service.js";
import { getAuditLogById, listAuditLogs } from "./audit.service.js";
import { logEmitter } from "../../config/logEmitter.js";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { cancelScheduleCascade } from "../schedules/cancelCascade.js";
import { auditContextFromRequest } from "../../core/audit/requestContext.js";
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
export function streamLogsController(req, res) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    const onLog = (entry) => {
        res.write(`data: ${JSON.stringify(entry)}\n\n`);
    };
    logEmitter.on("log", onLog);
    const heartbeat = setInterval(() => {
        res.write(": heartbeat\n\n");
    }, 30_000);
    req.on("close", () => {
        clearInterval(heartbeat);
        logEmitter.off("log", onLog);
    });
}
export async function listAuditLogsController(req, res, next) {
    try {
        const query = req.validatedQuery ?? {};
        const listInput = {
            page: query.page ?? 1,
            limit: query.limit ?? 20,
        };
        if (query.action)
            listInput.action = query.action;
        if (query.actorId !== undefined)
            listInput.actorId = query.actorId;
        if (query.entityType)
            listInput.entityType = query.entityType;
        if (query.fromDate)
            listInput.fromDate = query.fromDate;
        if (query.toDate)
            listInput.toDate = query.toDate;
        const result = await listAuditLogs(listInput);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function getAuditLogByIdController(req, res, next) {
    try {
        const result = await getAuditLogById(Number(req.params.id));
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function cancelScheduleController(req, res, next) {
    try {
        const result = await cancelScheduleCascade(Number(req.params.id), auditContextFromRequest(req));
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=controller.js.map