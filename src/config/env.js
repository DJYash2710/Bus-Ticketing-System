// src/config/env.ts
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
function readPositiveInt(value, fallback) {
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
    gstRate: Number(process.env.GST_RATE || '0.18'),
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    trustProxy: process.env.TRUST_PROXY === 'true',
    rateLimit: {
        enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
        strict: {
            windowMs: readPositiveInt(process.env.RATE_LIMIT_STRICT_WINDOW_MS, 15 * 60 * 1000),
            max: readPositiveInt(process.env.RATE_LIMIT_STRICT_MAX, 950),
        },
        moderate: {
            windowMs: readPositiveInt(process.env.RATE_LIMIT_MODERATE_WINDOW_MS, 60 * 1000),
            max: readPositiveInt(process.env.RATE_LIMIT_MODERATE_MAX, 950),
        },
    },
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
};
//# sourceMappingURL=env.js.map