// src/core/utils/jwt.ts
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export type JwtPayload = {
  sub: number; // user id
  role: string;
  busOperatorId?: number | null;
};

export type RefreshJwtPayload = JwtPayload & {
  jti: string;
};

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: "15m",
  });
}

export function signRefreshToken(payload: JwtPayload, jti: string) {
  return jwt.sign({ ...payload, jti }, env.jwtRefreshSecret, {
    expiresIn: "30d",
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtAccessSecret) as unknown as JwtPayload;
}

export function verifyRefreshToken(token: string): RefreshJwtPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as unknown as RefreshJwtPayload;
}
