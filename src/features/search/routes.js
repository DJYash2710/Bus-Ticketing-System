import { Router } from "express";
import { searchSchedulesController } from "./controller.js";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import { searchSchedulesSchema } from "./validators.js";
const router = Router();
router.get("/", authMiddleware, validate(searchSchedulesSchema), searchSchedulesController);
export const searchRouter = router;
//# sourceMappingURL=routes.js.map