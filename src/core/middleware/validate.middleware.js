import { ApiError } from "../utils/apiError.js";
export function validate(schema) {
    return (req, _res, next) => {
        try {
            if (schema.body) {
                const { error, value } = schema.body.validate(req.body, {
                    abortEarly: false,
                    stripUnknown: true,
                });
                if (error) {
                    const details = error.details.map((d) => d.message);
                    throw new ApiError(400, `Invalid request body: ${details.join(", ")}`);
                }
                req.body = value;
            }
            if (schema.query) {
                const { error, value } = schema.query.validate(req.query, {
                    abortEarly: false,
                    stripUnknown: true,
                    convert: true,
                });
                if (error) {
                    const details = error.details.map((d) => d.message);
                    throw new ApiError(400, `Invalid query params: ${details.join(", ")}`);
                }
                req.validatedQuery = value;
            }
            if (schema.params) {
                const { error, value } = schema.params.validate(req.params, {
                    abortEarly: false,
                    stripUnknown: true,
                });
                if (error) {
                    const details = error.details.map((d) => d.message);
                    throw new ApiError(400, `Invalid route params: ${details.join(", ")}`);
                }
                req.params = value;
            }
            next();
        }
        catch (err) {
            next(err);
        }
    };
}
//# sourceMappingURL=validate.middleware.js.map