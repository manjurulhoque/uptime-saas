import { Request, Response, NextFunction } from "express";
import { z, ZodType } from "zod";
import logger from "../config/logger";
import { errorResponse } from "../utils/response";

// Validation middleware factory
export const validate = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = schema.parse(req.body);
            req.body = result; // Replace with validated and sanitized data
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorDetails = error.issues.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                    value: err.input,
                }));

                logger.warn("Validation failed", {
                    errors: errorDetails,
                    body: req.body,
                    ip: req.ip,
                    userAgent: req.get("User-Agent"),
                    path: req.path,
                });

                return res.status(400).json(errorResponse("Validation failed", "VALIDATION_ERROR", errorDetails));
            }

            // Handle unexpected errors
            logger.error("Validation middleware error", {
                error: error instanceof Error ? error.message : "Unknown error",
                body: req.body,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
                path: req.path,
            });

            return res.status(500).json(errorResponse("Validation error", "VALIDATION_ERROR"));
        }
    };
};

// Common validation schemas
export const authSchemas = {
    register: z
        .object({
            first_name: z.string().min(1, "First name is required"),
            last_name: z.string().min(1, "Last name is required"),
            email: z.email("Please provide a valid email address"),
            password: z
                .string()
                .min(8, "Password must be at least 8 characters long")
                .regex(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]/,
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                ),
            confirm_password: z.string(),
        })
        .refine((data) => data.password === data.confirm_password, {
            message: "Passwords do not match",
            path: ["confirm_password"],
        }),

    login: z.object({
        email: z.email("Please provide a valid email address"),
        password: z.string().min(1, "Password is required"),
    }),

    refreshToken: z.object({
        refresh_token: z.string().min(1, "Refresh token is required"),
    }),

    changePassword: z
        .object({
            current_password: z.string().min(1, "Current password is required"),
            new_password: z
                .string()
                .min(8, "New password must be at least 8 characters long")
                .regex(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]/,
                    "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                ),
            confirm_new_password: z.string(),
        })
        .refine((data) => data.new_password === data.confirm_new_password, {
            message: "New passwords do not match",
            path: ["confirm_new_password"],
        }),
};

// Monitor validation schemas
export const monitorSchemas = {
    create: z.object({
        url: z.url("Please provide a valid URL"),
        interval: z
            .number({
                error: "Interval is required",
            })
            .int()
            .min(1, "Interval must be at least 1 minute")
            .max(1440, "Interval cannot exceed 1440 minutes (24 hours)")
    }),

    update: z
        .object({
            url: z.url("Please provide a valid URL").optional(),
            interval: z
                .number()
                .int()
                .min(1, "Interval must be at least 1 minute")
                .max(1440, "Interval cannot exceed 1440 minutes (24 hours)")
                .optional(),
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: "At least one field must be provided for update",
        }),
};

// Error handling middleware
export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    logger.error("Unhandled error", {
        error: error.message,
        stack: error.stack,
        body: req.body,
        query: req.query,
        params: req.params,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        path: req.path,
        method: req.method,
    });

    res.status(500).json(errorResponse("Internal server error", "INTERNAL_ERROR"));
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
    logger.warn("Route not found", {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
    });

    res.status(404).json(errorResponse("Route not found", "NOT_FOUND"));
};
