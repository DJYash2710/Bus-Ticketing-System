// src/core/middleware/validate.middleware.ts
import type { NextFunction, Request, Response } from "express";
import Joi, { type ObjectSchema } from "joi";
import { ApiError } from "../utils/apiError.js";

type SchemaConfig = {
  body?: ObjectSchema;
  query?: ObjectSchema;
  params?: ObjectSchema;
};

export function validate(schema: SchemaConfig) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        const { error, value } = schema.body.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          const details = error.details.map((d) => d.message);
          throw new ApiError(
            400,
            `Invalid request body: ${details.join(", ")}`,
          );
        }
        req.body = value;
      }

      if (schema.query) {
        const { error, value } = schema.query.validate(req.query, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          const details = error.details.map((d) => d.message);
          throw new ApiError(
            400,
            `Invalid query params: ${details.join(", ")}`,
          );
        }
        req.query = value;
      }

      if (schema.params) {
        const { error, value } = schema.params.validate(req.params, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          const details = error.details.map((d) => d.message);
          throw new ApiError(
            400,
            `Invalid route params: ${details.join(", ")}`,
          );
        }
        req.params = value;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
