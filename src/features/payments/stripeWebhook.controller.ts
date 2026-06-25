import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../core/utils/apiError.js';
import { processStripeWebhookEvent } from './stripeWebhook.service.js';

export async function stripeWebhookController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const signature = req.headers['stripe-signature'];

    if (typeof signature !== 'string') {
      throw new ApiError(400, 'Missing Stripe-Signature header');
    }

    if (!Buffer.isBuffer(req.body)) {
      throw new ApiError(400, 'Invalid webhook payload');
    }

    const result = await processStripeWebhookEvent(req.body, signature);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
