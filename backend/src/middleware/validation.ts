import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import logger from "../config/logger";

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errorDetails = error.details.map((detail) => ({
                field: detail.path.join("."),
                message: detail.message,
                value: detail.context?.value,
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

        next();
    };
};

// Common validation schemas
export const authSchemas = {
    register: Joi.object({
        email: Joi.string().email().required().messages({
            "string.email": "Please provide a valid email address",
            "any.required": "Email is required",
        }),
        password: Joi.string()
            .min(8)
            .pattern(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
            )
            .required()
            .messages({
                "string.min": "Password must be at least 8 characters long",
                "string.pattern.base":
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                "any.required": "Password is required",
            }),
        confirmPassword: Joi.string()
            .valid(Joi.ref("password"))
            .required()
            .messages({
                "any.only": "Passwords do not match",
                "any.required": "Password confirmation is required",
            }),
    }),

    login: Joi.object({
        email: Joi.string().email().required().messages({
            "string.email": "Please provide a valid email address",
            "any.required": "Email is required",
        }),
        password: Joi.string().required().messages({
            "any.required": "Password is required",
        }),
    }),

    refreshToken: Joi.object({
        refreshToken: Joi.string().required().messages({
            "any.required": "Refresh token is required",
        }),
    }),

    changePassword: Joi.object({
        currentPassword: Joi.string().required().messages({
            "any.required": "Current password is required",
        }),
        newPassword: Joi.string()
            .min(8)
            .pattern(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
            )
            .required()
            .messages({
                "string.min": "New password must be at least 8 characters long",
                "string.pattern.base":
                    "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                "any.required": "New password is required",
            }),
        confirmNewPassword: Joi.string()
            .valid(Joi.ref("newPassword"))
            .required()
            .messages({
                "any.only": "New passwords do not match",
                "any.required": "New password confirmation is required",
            }),
    }),
};

// Error handling middleware
export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
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
