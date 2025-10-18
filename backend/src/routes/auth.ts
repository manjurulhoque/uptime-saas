import { Router, Request, Response } from "express";
import authService from "../services/authService";
import { authenticateToken } from "../middleware/auth";
import { validate, authSchemas } from "../middleware/validation";
import logger from "../config/logger";
import { successResponse, errorResponse } from "../utils/response";
import { UserExistsError } from "../utils/errors";
import prisma from "../db";

const router = Router();

// Register endpoint
router.post(
    "/register",
    validate(authSchemas.register),
    async (req: Request, res: Response) => {
        try {
            const { first_name, last_name, email, password } = req.body;

            const result = await authService.register({
                first_name,
                last_name,
                email,
                password,
            });

            logger.info("User registration successful", {
                userId: result.user.id,
                email: result.user.email,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            res.status(201).json(
                successResponse({
                    user: {
                        id: result.user.id,
                        first_name: result.user.first_name,
                        last_name: result.user.last_name,
                        email: result.user.email,
                        created_at: result.user.created_at,
                    },
                    tokens: result.tokens,
                }),
            );
        } catch (error) {
            logger.error("Registration endpoint error", {
                error: error instanceof Error ? error.message : "Unknown error",
                body: req.body,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            if (error instanceof UserExistsError) {
                return res.status(409).json(
                    errorResponse(error.message, "USER_EXISTS", [
                        {
                            field: "email",
                            message: error.message,
                        },
                    ]),
                );
            }

            res.status(500).json(
                errorResponse("Registration failed", "REGISTRATION_ERROR"),
            );
        }
    },
);

// Login endpoint
router.post(
    "/login",
    validate(authSchemas.login),
    async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            const result = await authService.login({ email, password });

            logger.info("User login successful", {
                userId: result.user.id,
                email: result.user.email,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            res.status(200).json(
                successResponse({
                    user: {
                        id: result.user.id,
                        email: result.user.email,
                        first_name: result.user.first_name,
                        last_name: result.user.last_name,
                        is_admin: result.user.is_admin,
                        is_active: result.user.is_active,
                        created_at: result.user.created_at,
                    },
                    tokens: result.tokens,
                }),
            );
        } catch (error) {
            logger.error("Login endpoint error", {
                error: error instanceof Error ? error.message : "Unknown error",
                body: req.body,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            if (
                error instanceof Error &&
                error.message === "Invalid credentials"
            ) {
                return res
                    .status(401)
                    .json(
                        errorResponse(
                            "Invalid credentials",
                            "INVALID_CREDENTIALS",
                        ),
                    );
            }

            res.status(500).json(errorResponse("Login failed", "LOGIN_ERROR"));
        }
    },
);

// Refresh token endpoint
router.post(
    "/refresh",
    validate(authSchemas.refreshToken),
    async (req: Request, res: Response) => {
        try {
            const { refresh_token } = req.body;

            const tokens = await authService.refreshToken(refresh_token);

            logger.info("Token refresh successful", {
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            res.status(200).json(
                successResponse({
                    tokens,
                }),
            );
        } catch (error) {
            logger.error("Token refresh endpoint error", {
                error: error instanceof Error ? error.message : "Unknown error",
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            if (
                error instanceof Error &&
                error.message === "Invalid refresh token"
            ) {
                return res
                    .status(401)
                    .json(
                        errorResponse(
                            "Invalid refresh token",
                            "INVALID_REFRESH_TOKEN",
                        ),
                    );
            }

            res.status(500).json(
                errorResponse("Token refresh failed", "REFRESH_ERROR"),
            );
        }
    },
);

// Change password endpoint
router.post(
    "/change-password",
    authenticateToken,
    validate(authSchemas.changePassword),
    async (req: Request, res: Response) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user!.id;

            await authService.changePassword(
                userId,
                currentPassword,
                newPassword,
            );

            logger.info("Password change successful", {
                userId,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            res.status(200).json(successResponse());
        } catch (error) {
            logger.error("Password change endpoint error", {
                error: error instanceof Error ? error.message : "Unknown error",
                userId: req.user?.id,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            if (
                error instanceof Error &&
                error.message === "Current password is incorrect"
            ) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            "Current password is incorrect",
                            "INVALID_CURRENT_PASSWORD",
                        ),
                    );
            }

            if (error instanceof Error && error.message === "User not found") {
                return res
                    .status(404)
                    .json(errorResponse("User not found", "USER_NOT_FOUND"));
            }

            res.status(500).json(
                errorResponse(
                    "Password change failed",
                    "PASSWORD_CHANGE_ERROR",
                ),
            );
        }
    },
);

// Logout endpoint
router.post(
    "/logout",
    authenticateToken,
    async (req: Request, res: Response) => {
        try {
            const userId = req.user!.id;

            await authService.logout(userId);

            logger.info("User logout successful", {
                userId,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            res.status(200).json(successResponse());
        } catch (error) {
            logger.error("Logout endpoint error", {
                error: error instanceof Error ? error.message : "Unknown error",
                userId: req.user?.id,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            res.status(500).json(
                errorResponse("Logout failed", "LOGOUT_ERROR"),
            );
        }
    },
);

// Get current user profile
router.get("/me", authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;

        // Fetch complete user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                is_admin: true,
                is_active: true,
                created_at: true,
                updated_at: true,
            },
        });

        if (!user) {
            return res
                .status(404)
                .json(errorResponse("User not found", "USER_NOT_FOUND"));
        }

        logger.info("User profile accessed", {
            userId: user.id,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        });

        res.status(200).json(
            successResponse({
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    is_admin: user.is_admin,
                    is_active: user.is_active,
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                },
            }),
        );
    } catch (error) {
        logger.error("Get profile endpoint error", {
            error: error instanceof Error ? error.message : "Unknown error",
            userId: req.user?.id,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        });

        res.status(500).json(
            errorResponse("Failed to get user profile", "PROFILE_ERROR"),
        );
    }
});

// Update user profile
router.put(
    "/profile",
    authenticateToken,
    validate(authSchemas.updateProfile),
    async (req: Request, res: Response) => {
        try {
            const userId = req.user!.id;
            const { first_name, last_name, email } = req.body;

            const updatedUser = await authService.updateProfile(userId, {
                first_name,
                last_name,
                email,
            });

            logger.info("User profile updated successfully", {
                userId,
                updatedFields: Object.keys(req.body),
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            res.status(200).json(
                successResponse({
                    user: updatedUser,
                }),
            );
        } catch (error) {
            logger.error("Profile update endpoint error", {
                error: error instanceof Error ? error.message : "Unknown error",
                userId: req.user?.id,
                body: req.body,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            if (
                error instanceof Error &&
                error.message === "Email already exists"
            ) {
                return res.status(409).json(
                    errorResponse("Email already exists", "EMAIL_EXISTS", [
                        {
                            field: "email",
                            message: "Email already exists",
                        },
                    ]),
                );
            }

            res.status(500).json(
                errorResponse("Profile update failed", "PROFILE_UPDATE_ERROR"),
            );
        }
    },
);

export default router;
