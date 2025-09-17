import { Request, Response, NextFunction } from "express";
import { z, ZodType } from "zod";
import logger from "../config/logger";

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

                return res.status(400).json({
                    error: "Validation failed",
                    details: errorDetails,
                    code: "VALIDATION_ERROR",
                });
            }

            // Handle unexpected errors
            logger.error("Validation middleware error", {
                error: error instanceof Error ? error.message : "Unknown error",
                body: req.body,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
                path: req.path,
            });

            return res.status(500).json({
                error: "Validation error",
                code: "VALIDATION_ERROR",
            });
        }
    };
};

// Common validation schemas
export const authSchemas = {
    register: z
        .object({
            email: z.email("Please provide a valid email address"),
            password: z
                .string()
                .min(8, "Password must be at least 8 characters long")
                .regex(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]/,
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                ),
            confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        }),

    login: z.object({
        email: z.email("Please provide a valid email address"),
        password: z.string().min(1, "Password is required"),
    }),

    refreshToken: z.object({
        refreshToken: z.string().min(1, "Refresh token is required"),
    }),

    changePassword: z
        .object({
            currentPassword: z.string().min(1, "Current password is required"),
            newPassword: z
                .string()
                .min(8, "New password must be at least 8 characters long")
                .regex(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]/,
                    "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                ),
            confirmNewPassword: z.string(),
        })
        .refine((data) => data.newPassword === data.confirmNewPassword, {
            message: "New passwords do not match",
            path: ["confirmNewPassword"],
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

    res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        ...(process.env.NODE_ENV === "development" && {
            message: error.message,
            stack: error.stack,
        }),
    });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
    logger.warn("Route not found", {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
    });

    res.status(404).json({
        error: "Route not found",
        code: "NOT_FOUND",
        path: req.path,
        method: req.method,
    });
};
