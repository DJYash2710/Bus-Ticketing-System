// src/features/cities/routes.ts
import { Router } from "express";
import { createCityController, deleteCityController, getCityByIdController, listCitiesController, updateCityController, } from "./controller.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import { createCitySchema, updateCitySchema } from "./validators.js";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
const router = Router();
// Anyone logged in can list/search cities (you can relax later if you want)
router.get("/", authMiddleware, listCitiesController);
router.get("/:id", authMiddleware, getCityByIdController);
// Admin-only modifications
router.post("/", authMiddleware, requireRole(["ADMIN"]), validate(createCitySchema), createCityController);
router.patch("/:id", authMiddleware, requireRole(["ADMIN"]), validate(updateCitySchema), updateCityController);
router.delete("/:id", authMiddleware, requireRole(["ADMIN"]), deleteCityController);
export const cityRouter = router;
//# sourceMappingURL=routes.js.map