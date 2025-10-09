import { Router, Request, Response } from "express";
import authService from "../services/authService";
import { authenticateToken } from "../middleware/auth";
import { validate, authSchemas } from "../middleware/validation";
import logger from "../config/logger";
import { successResponse, errorResponse } from "../utils/response";
import { UserExistsError } from "../utils/errors";

const router = Router();

// Register endpoint
router.post(
    "/register",
    validate(authSchemas.register),
    async (req: Request, res: Response) => {
        try {
            const { first_name, last_name, email, password } = req.body;

            const result = await authService.register({ first_name, last_name, email, password });

            logger.info("User registration successful", {
                userId: result.user.id,
                email: result.user.email,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            res.status(201).json(successResponse({
                user: {
                    id: result.user.id,
                    first_name: result.user.first_name,
                    last_name: result.user.last_name,
                    email: result.user.email,
                    created_at: result.user.created_at,
                },
                tokens: result.tokens,
            }));
        } catch (error) {
            logger.error("Registration endpoint error", {
                error: error instanceof Error ? error.message : "Unknown error",
                body: req.body,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            if (
                error instanceof UserExistsError
            ) {
                return res.status(409).json(
                    errorResponse(error.message, "USER_EXISTS", [{
                        field: "email",
                        message: error.message,
                    }])
                );
            }

            res.status(500).json(errorResponse("Registration failed", "REGISTRATION_ERROR"));
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

            res.status(200).json(successResponse({
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
            }));
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
                return res.status(401).json(errorResponse("Invalid credentials", "INVALID_CREDENTIALS"));
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
            const { refreshToken } = req.body;

            const tokens = await authService.refreshToken(refreshToken);

            logger.info("Token refresh successful", {
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            res.status(200).json(successResponse({
                data: {
                    tokens,
                }
            }));
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
                return res.status(401).json(errorResponse("Invalid refresh token", "INVALID_REFRESH_TOKEN"));
            }

            res.status(500).json(errorResponse("Token refresh failed", "REFRESH_ERROR"));
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
                return res.status(400).json(errorResponse("Current password is incorrect", "INVALID_CURRENT_PASSWORD"));
            }

            if (error instanceof Error && error.message === "User not found") {
                return res.status(404).json(errorResponse("User not found", "USER_NOT_FOUND"));
            }

            res.status(500).json(errorResponse("Password change failed", "PASSWORD_CHANGE_ERROR"));
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

            res.status(500).json(errorResponse("Logout failed", "LOGOUT_ERROR"));
        }
    },
);

// Get current user profile
router.get("/me", authenticateToken, async (req: Request, res: Response) => {
    try {
        const user = req.user!;

        logger.info("User profile accessed", {
            userId: user.id,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        });

        res.status(200).json(successResponse({
            user: {
                id: user.id,
                email: user.email,
            },
        }));
    } catch (error) {
        logger.error("Get profile endpoint error", {
            error: error instanceof Error ? error.message : "Unknown error",
            userId: req.user?.id,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        });

        res.status(500).json(errorResponse("Failed to get user profile", "PROFILE_ERROR"));
    }
});

export default router;
