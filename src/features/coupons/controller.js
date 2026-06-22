import { createCoupon, deleteCoupon, listCoupons, previewCoupon, updateCoupon, } from "./service.js";
export async function validateCouponController(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const query = req.validatedQuery ?? {};
        const result = await previewCoupon(req.params.code, userId, query.baseAmount);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function listCouponsController(_req, res, next) {
    try {
        const result = await listCoupons();
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function createCouponController(req, res, next) {
    try {
        const result = await createCoupon(req.body);
        res.status(201).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function updateCouponController(req, res, next) {
    try {
        const result = await updateCoupon(Number(req.params.id), req.body);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function deleteCouponController(req, res, next) {
    try {
        const result = await deleteCoupon(Number(req.params.id));
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=controller.js.map