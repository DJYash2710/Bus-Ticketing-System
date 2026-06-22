import { Router } from "express";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import { changePasswordController, getProfileController, updateProfileController, } from "./controller.js";
import { changePasswordSchema, updateProfileSchema } from "./validators.js";
const router = Router();
router.use(authMiddleware);
router.get("/me", getProfileController);
router.patch("/me", validate(updateProfileSchema), updateProfileController);
router.patch("/me/password", validate(changePasswordSchema), changePasswordController);
export const userRouter = router;
//# sourceMappingURL=routes.js.map