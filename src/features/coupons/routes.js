import { Router } from "express";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import { createCouponController, deleteCouponController, listCouponsController, updateCouponController, validateCouponController, } from "./controller.js";
import { couponIdParamSchema, createCouponSchema, updateCouponSchema, validateCouponSchema, } from "./validators.js";
const router = Router();
router.get("/validate/:code", authMiddleware, validate(validateCouponSchema), validateCouponController);
router.use(authMiddleware, requireRole(["ADMIN"]));
router.get("/", listCouponsController);
router.post("/", validate(createCouponSchema), createCouponController);
router.patch("/:id", validate(updateCouponSchema), updateCouponController);
router.delete("/:id", validate(couponIdParamSchema), deleteCouponController);
export const couponRouter = router;
//# sourceMappingURL=routes.js.map