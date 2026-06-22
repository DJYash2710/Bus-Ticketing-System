import type { NextFunction, Request, Response } from "express";
import type { ObjectSchema } from "joi";
type SchemaConfig = {
    body?: ObjectSchema;
    query?: ObjectSchema;
    params?: ObjectSchema;
};
export declare function validate(schema: SchemaConfig): (req: Request, _res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validate.middleware.d.ts.map