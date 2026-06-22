// src/features/auth/routes.ts
import { Router } from "express";
import { registerController, loginController, refreshController, logoutController } from "./controller.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import { strictRateLimiter } from "../../core/middleware/rateLimit.middleware.js";
import { registerSchema, loginSchema, refreshSchema } from "./validators.js";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";

const router = Router();

router.post("/register", strictRateLimiter, validate(registerSchema), registerController);
router.post("/login", strictRateLimiter, validate(loginSchema), loginController);
router.post("/refresh", validate(refreshSchema), refreshController);
router.post("/logout", authMiddleware, logoutController);

// Lightweight auth check (returns id + role from token only)
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
