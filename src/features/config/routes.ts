import { Router } from "express";
import { env } from "../../config/env.js";

const router = Router();

/** Public pricing / loyalty settings sourced from server environment. */
router.get("/", (_req, res) => {
  res.json({
    platformCommissionRate: env.platformCommissionRate,
    gstRate: env.gstRate,
    loyaltyPointValue: env.loyaltyPointValue,
    loyaltyEarnRate: env.loyaltyEarnRate,
    referralBonusCredits: env.referralBonusCredits,
    paymentProvider: env.paymentProvider,
    stripePublishableKey:
      env.paymentProvider === 'STRIPE' ? env.stripe.publishableKey : '',
  });
});

export const configRouter = router;
