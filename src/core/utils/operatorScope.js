import { ApiError } from "./apiError.js";
export function isOperator(user) {
    return user.role === "OPERATOR";
}
export function requireOperatorFleetId(user) {
    if (!user.busOperatorId) {
        throw new ApiError(403, "Operator account is not linked to a fleet");
    }
    return user.busOperatorId;
}
//# sourceMappingURL=operatorScope.js.map