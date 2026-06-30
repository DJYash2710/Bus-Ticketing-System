// src/features/cities/routes.ts
import { Router } from "express";
import { createCityController, deleteCityController, getCityByIdController, listCitiesController, updateCityController, } from "./controller.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import { createCitySchema, updateCitySchema } from "./validators.js";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
const router = Router();
// Public read — city list is reference data for search autocomplete
router.get("/", listCitiesController);
router.get("/:id", getCityByIdController);
// Admin-only modifications
router.post("/", authMiddleware, requireRole(["ADMIN"]), validate(createCitySchema), createCityController);
router.patch("/:id", authMiddleware, requireRole(["ADMIN"]), validate(updateCitySchema), updateCityController);
router.delete("/:id", authMiddleware, requireRole(["ADMIN"]), deleteCityController);
export const cityRouter = router;
//# sourceMappingURL=routes.js.map