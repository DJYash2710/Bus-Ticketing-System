// src/features/auth/service.ts
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../core/utils/jwt.js";
import { env } from "../../config/env.js";
import { UserRole } from "@prisma/client";

const SALT_ROUNDS = 10;

type RegisterInput = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  referralCode?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { phone: input.phone || "" }] },
  });

  if (existing) {
    throw new ApiError(409, "User with this email or phone already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  // Generate user referral code (simple example)
  const referralCode = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return prisma.$transaction(async (tx) => {
    // Handle referral: if referralCode provided, set referredBy and credit bonus
    let referredById: number | undefined;

    if (input.referralCode) {
      const referrer = await tx.user.findFirst({
        where: { referralCode: input.referralCode },
      });

      if (!referrer) {
        throw new ApiError(400, "Invalid referral code");
      }

      referredById = referrer.id;
    }

    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        passwordHash,
        role: UserRole.USER,
        referralCode,
        referredById: referredById ?? null,
      },
    });

    // If they used a referral code, credit referral bonus
    if (referredById) {
      await tx.loyaltyEvent.create({
        data: {
          userId: user.id,
          type: "EARN_REFERRAL",
          credits: env.referralBonusCredits,
          description: `Referral bonus of ${env.referralBonusCredits} credits`,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          creditsBalance: {
            increment: env.referralBonusCredits,
          },
        },
      });
    }

    const payload = { sub: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshTokenJwt = signRefreshToken(payload);

    // Also store refresh token record (simple version: store raw jwt; later you can hash/rotate)
    await tx.refreshToken.create({
      data: {
        userId: user.id,
        token: uuidv4(), // placeholder token identifier if you go for rotation later
        userAgent: "unknown",
        ipAddress: "unknown",
        isRevoked: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        creditsBalance: user.creditsBalance,
        referralCode: user.referralCode,
      },
      tokens: {
        accessToken,
        refreshToken: refreshTokenJwt,
      },
    };
  });
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is disabled");
  }

  const payload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshTokenJwt = signRefreshToken(payload);

  // TODO: upsert/rotate refresh token record; keeping simple for now
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: uuidv4(),
      userAgent: "unknown",
      ipAddress: "unknown",
      isRevoked: false,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      creditsBalance: user.creditsBalance,
      referralCode: user.referralCode,
    },
    tokens: {
      accessToken,
      refreshToken: refreshTokenJwt,
    },
  };
}

export async function refreshTokens(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user || !user.isActive) {
    throw new ApiError(401, "User not found or inactive");
  }

  const tokenPayload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(tokenPayload);
  const newRefreshToken = signRefreshToken(tokenPayload);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: uuidv4(),
      userAgent: "unknown",
      ipAddress: "unknown",
      isRevoked: false,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      creditsBalance: user.creditsBalance,
      referralCode: user.referralCode,
    },
    tokens: {
      accessToken,
      refreshToken: newRefreshToken,
    },
  };
}

export async function logoutUser(userId: number) {
  await prisma.refreshToken.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
  });

  return { message: "Logged out successfully" };
}
