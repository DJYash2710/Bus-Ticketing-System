import { Router } from "express";
import { authMiddleware } from "../../core/middleware/auth.middleware.js";
import {
  getLoyaltyHistoryController,
  getLoyaltySummaryController,
} from "./controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/summary", getLoyaltySummaryController);
router.get("/history", getLoyaltyHistoryController);

export const loyaltyRouter = router;
