// src/config/env.ts
import dotenv from 'dotenv';
dotenv.config();

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
};