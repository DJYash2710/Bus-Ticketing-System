import { requireOperatorFleetId } from "../../core/utils/operatorScope.js";
import { cancelBooking, createBooking, getBookingById, getMyBookings, getOperatorBookings, } from "./service.js";
export async function createBookingController(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const result = await createBooking({
            userId,
            scheduleId: req.body.scheduleId,
            seatNumbers: req.body.seatNumbers,
            boardingPoint: req.body.boardingPoint,
            droppingPoint: req.body.droppingPoint,
            couponCode: req.body.couponCode,
            creditsToRedeem: req.body.creditsToRedeem,
        });
        res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
}
export async function getBookingByIdController(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const result = await getBookingById(Number(req.params.id), userId);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
}
export async function getMyBookingsController(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const result = await getMyBookings(userId);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
}
export async function getOperatorBookingsController(req, res, next) {
    try {
        const caller = req.user;
        const fleetId = requireOperatorFleetId(caller);
        const result = await getOperatorBookings(fleetId);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
}
export async function cancelBookingController(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const result = await cancelBooking(Number(req.params.id), userId);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=controller.js.map