import type { RequestHandler } from "express";
/** Auth, bookings, payments — sensitive write endpoints. */
export declare const strictRateLimiter: RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** Search and similar read-heavy endpoints. */
export declare const moderateRateLimiter: RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=rateLimit.middleware.d.ts.map