import { Router } from "express";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";
import {
  initiatePaymentController,
  confirmPaymentController,
  getPaymentController,
} from "./controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/initiate/:bookingId", initiatePaymentController);
router.patch("/confirm/:paymentId", confirmPaymentController);
router.get("/booking/:bookingId", getPaymentController);

export const paymentRouter = router;