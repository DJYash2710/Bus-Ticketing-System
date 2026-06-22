export type JwtPayload = {
    sub: number;
    role: string;
    busOperatorId?: number | null;
};
export type RefreshJwtPayload = JwtPayload & {
    jti: string;
};
export declare function signAccessToken(payload: JwtPayload): string;
export declare function signRefreshToken(payload: JwtPayload, jti: string): string;
export declare function verifyAccessToken(token: string): JwtPayload;
export declare function verifyRefreshToken(token: string): RefreshJwtPayload;
//# sourceMappingURL=jwt.d.ts.map