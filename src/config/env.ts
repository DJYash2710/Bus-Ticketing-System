// src/config/env.ts
import dotenv from 'dotenv';
dotenv.config();

function readPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || '4000',

  databaseUrl: process.env.DATABASE_URL || '',

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',

  referralBonusCredits: Number(process.env.REFERRAL_BONUS_CREDITS || '300'),
  loyaltyEarnRate: Number(process.env.LOYALTY_EARN_RATE || '0.075'),
  loyaltyPointValue: Number(process.env.LOYALTY_POINT_VALUE || '0.1'),
  platformCommissionRate: Number(process.env.PLATFORM_COMMISSION_RATE || '0.05'),

  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  trustProxy: process.env.TRUST_PROXY === 'true',

  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    strict: {
      windowMs: readPositiveInt(process.env.RATE_LIMIT_STRICT_WINDOW_MS, 15 * 60 * 1000),
      max: readPositiveInt(process.env.RATE_LIMIT_STRICT_MAX, 10),
    },
    moderate: {
      windowMs: readPositiveInt(process.env.RATE_LIMIT_MODERATE_WINDOW_MS, 60 * 1000),
      max: readPositiveInt(process.env.RATE_LIMIT_MODERATE_MAX, 60),
    },
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },

  paymentProvider: normalizePaymentProvider(process.env.PAYMENT_PROVIDER),
};

function normalizePaymentProvider(
  value: string | undefined,
): 'MOCK' | 'STRIPE' {
  const normalized = (value || 'MOCK').trim().toUpperCase();

  if (normalized === 'STRIPE') {
    return 'STRIPE';
  }

  if (normalized !== 'MOCK' && normalized.length > 0) {
    throw new Error(
      `Invalid PAYMENT_PROVIDER "${value}". Expected MOCK or STRIPE.`,
    );
  }

  return 'MOCK';
}
