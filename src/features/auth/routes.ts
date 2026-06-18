// src/features/auth/routes.ts
import { Router } from "express";
import { registerController, loginController } from "./controller.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "./validators.js";

const router = Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);

// Later we'll add /refresh, /logout, etc.

export const authRouter = router;
