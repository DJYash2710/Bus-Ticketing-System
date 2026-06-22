import { ApiError } from "./apiError.js";
import type { AuthUser } from "../middleware/auth.middleware.js";

export function isOperator(user: AuthUser): boolean {
  return user.role === "OPERATOR";
}

export function requireOperatorFleetId(user: AuthUser): number {
  if (!user.busOperatorId) {
    throw new ApiError(403, "Operator account is not linked to a fleet");
  }
  return user.busOperatorId;
}
