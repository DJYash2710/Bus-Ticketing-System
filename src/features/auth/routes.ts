// src/features/auth/routes.ts
import { Router } from "express";
import { registerController, loginController } from "./controller.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "./validators.js";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);

// Simple protected route to test auth
router.get("/me", authMiddleware, (req, res) => {
  const user = req.user!;
  res.json({
    success: true,
    data: {
      id: user.id,
      role: user.role,
    },
  });
});

export const authRouter = router;
