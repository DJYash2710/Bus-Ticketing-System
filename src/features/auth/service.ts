// src/features/auth/service.ts
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../core/utils/jwt.js";
import { env } from "../../config/env.js";
import { UserRole } from "@prisma/client";
import { logAuthEvent } from "./authLog.js";
import { AuditAction, AuditEntityType } from "../../core/audit/actions.js";
import { auditLog, auditLogFrom } from "../../core/audit/auditLog.service.js";
import {
  auditContextFromClient,
  type AuditContext,
} from "../../core/audit/requestContext.js";

const SALT_ROUNDS = 10;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function buildTokenPayload(user: {
  id: number;
  role: UserRole;
  busOperatorId: number | null;
}) {
  const payload: {
    sub: number;
    role: UserRole;
    busOperatorId?: number | null;
  } = {
    sub: user.id,
    role: user.role,
  };

  if (user.role === UserRole.OPERATOR) {
    payload.busOperatorId = user.busOperatorId;
  }

  return payload;
}

function refreshExpiresAt() {
  return new Date(Date.now() + REFRESH_TTL_MS);
}

async function createRefreshTokenRow(
  userId: number,
  jti: string,
  userAgent: string,
  ipAddress: string,
  db: Prisma.TransactionClient | typeof prisma = prisma,
) {
  await db.refreshToken.create({
    data: {
      userId,
      token: jti,
      userAgent,
      ipAddress,
      isRevoked: false,
      expiresAt: refreshExpiresAt(),
    },
  });
}

type ClientMeta = {
  userAgent: string;
  ipAddress: string;
};

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

export async function registerUser(
  input: RegisterInput,
  client: ClientMeta,
) {
  const phone = input.phone?.trim() || undefined;
  const appliedReferralCode =
    input.referralCode?.trim().toUpperCase() || undefined;

  const duplicateConditions: Array<{ email: string } | { phone: string }> = [
    { email: input.email },
  ];
  if (phone) {
    duplicateConditions.push({ phone });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: duplicateConditions },
  });

  if (existing) {
    throw new ApiError(409, "User with this email or phone already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const referralCode = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const result = await prisma.$transaction(async (tx) => {
    let referredById: number | undefined;

    if (appliedReferralCode) {
      const referrer = await tx.user.findFirst({
        where: { referralCode: appliedReferralCode },
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
        phone: phone ?? null,
        passwordHash,
        role: UserRole.USER,
        referralCode,
        referredById: referredById ?? null,
      },
    });

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

    const payload = buildTokenPayload(user);
    const accessToken = signAccessToken(payload);
    const jti = randomUUID();
    const refreshTokenJwt = signRefreshToken(payload, jti);

    await createRefreshTokenRow(
      user.id,
      jti,
      client.userAgent,
      client.ipAddress,
      tx,
    );

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

  logAuthEvent("info", "Registration successful", {
    event: "register_success",
    userId: result.user.id,
    email: result.user.email,
    ip: client.ipAddress,
  });

  auditLogFrom(auditContextFromClient(result.user.id, result.user.role, client), {
    action: AuditAction.REGISTER,
    entityType: AuditEntityType.USER,
    entityId: result.user.id,
    metadata: { email: result.user.email },
  });

  return result;
}

export async function loginUser(input: LoginInput, client: ClientMeta) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    logAuthEvent("warn", "Login failed: invalid credentials", {
      event: "login_failure",
      email: input.email,
      ip: client.ipAddress,
    });
    auditLog({
      actorId: null,
      actorRole: null,
      ipAddress: client.ipAddress,
      userAgent: client.userAgent,
      action: AuditAction.LOGIN_FAILED,
      entityType: AuditEntityType.USER,
      metadata: { email: input.email },
    });
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!isMatch) {
    logAuthEvent("warn", "Login failed: invalid credentials", {
      event: "login_failure",
      email: input.email,
      ip: client.ipAddress,
    });
    auditLog({
      actorId: user.id,
      actorRole: user.role,
      ipAddress: client.ipAddress,
      userAgent: client.userAgent,
      action: AuditAction.LOGIN_FAILED,
      entityType: AuditEntityType.USER,
      entityId: user.id,
      metadata: { email: input.email },
    });
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is disabled");
  }

  const payload = buildTokenPayload(user);
  const accessToken = signAccessToken(payload);
  const jti = randomUUID();
  const refreshTokenJwt = signRefreshToken(payload, jti);

  await createRefreshTokenRow(
    user.id,
    jti,
    client.userAgent,
    client.ipAddress,
  );

  logAuthEvent("info", "Login successful", {
    event: "login_success",
    userId: user.id,
    email: user.email,
    ip: client.ipAddress,
  });

  auditLogFrom(auditContextFromClient(user.id, user.role, client), {
    action: AuditAction.LOGIN_SUCCESS,
    entityType: AuditEntityType.USER,
    entityId: user.id,
    metadata: { email: user.email },
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

export async function refreshTokens(
  refreshToken: string,
  client: ClientMeta,
) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    logAuthEvent("warn", "Refresh failed: invalid or expired token", {
      event: "refresh_failure",
      ip: client.ipAddress,
    });
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const jti = payload.jti;
  if (!jti) {
    logAuthEvent("warn", "Refresh failed: missing token id", {
      event: "refresh_failure",
      userId: payload.sub,
      ip: client.ipAddress,
    });
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: jti },
  });

  if (!stored) {
    logAuthEvent("warn", "Refresh failed: token not found in store", {
      event: "refresh_failure",
      userId: payload.sub,
      ip: client.ipAddress,
    });
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  if (stored.isRevoked) {
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, isRevoked: false },
      data: { isRevoked: true },
    });
    logAuthEvent("warn", "Refresh token reuse detected; all sessions revoked", {
      event: "refresh_reuse_detected",
      userId: stored.userId,
      ip: client.ipAddress,
    });
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  if (stored.expiresAt < new Date()) {
    logAuthEvent("warn", "Refresh failed: token expired in store", {
      event: "refresh_failure",
      userId: stored.userId,
      ip: client.ipAddress,
    });
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user || !user.isActive) {
    logAuthEvent("warn", "Refresh failed: user not found or inactive", {
      event: "refresh_failure",
      userId: payload.sub,
      ip: client.ipAddress,
    });
    throw new ApiError(401, "User not found or inactive");
  }

  const tokenPayload = buildTokenPayload(user);
  const accessToken = signAccessToken(tokenPayload);
  const newJti = randomUUID();
  const newRefreshToken = signRefreshToken(tokenPayload, newJti);

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    }),
    prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: newJti,
        userAgent: client.userAgent,
        ipAddress: client.ipAddress,
        isRevoked: false,
        expiresAt: refreshExpiresAt(),
      },
    }),
  ]);

  logAuthEvent("info", "Token refresh successful", {
    event: "refresh_success",
    userId: user.id,
    email: user.email,
    ip: client.ipAddress,
  });

  auditLogFrom(auditContextFromClient(user.id, user.role, client), {
    action: AuditAction.REFRESH_TOKEN,
    entityType: AuditEntityType.USER,
    entityId: user.id,
    metadata: { email: user.email },
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

export async function logoutUser(
  userId: number,
  ip?: string,
  audit?: AuditContext,
) {
  await prisma.refreshToken.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
  });

  logAuthEvent("info", "Logout successful", {
    event: "logout",
    userId,
    ...(ip !== undefined ? { ip } : {}),
  });

  auditLogFrom(audit ?? { actorId: userId, ipAddress: ip ?? null }, {
    action: AuditAction.LOGOUT,
    entityType: AuditEntityType.USER,
    entityId: userId,
  });

  return { message: "Logged out successfully" };
}
