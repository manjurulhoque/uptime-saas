import { Router, Request, Response } from "express";
import authService from "../services/authService";
import { authenticateToken } from "../middleware/auth";
import { validate, authSchemas } from "../middleware/validation";
import logger from "../config/logger";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             email: "user@example.com"
 *             password: "password123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "User with this email already exists"
 *               code: "USER_EXISTS"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Registration failed"
 *               code: "REGISTRATION_ERROR"
 */
// Register endpoint
router.post(
  "/register",
  validate(authSchemas.register),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const result = await authService.register({ email, password });

      logger.info("User registration successful", {
        userId: result.user.id,
        email: result.user.email,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: result.user.id,
          email: result.user.email,
          createdAt: result.user.createdAt,
        },
        tokens: result.tokens,
      });
    } catch (error) {
      logger.error("Registration endpoint error", {
        error: error instanceof Error ? error.message : "Unknown error",
        body: req.body,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });

      if (
        error instanceof Error &&
        error.message === "User with this email already exists"
      ) {
        return res.status(409).json({
          error: "User with this email already exists",
          code: "USER_EXISTS",
        });
      }

      res.status(500).json({
        error: "Registration failed",
        code: "REGISTRATION_ERROR",
      });
    }
  },
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "user@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Invalid credentials"
 *               code: "INVALID_CREDENTIALS"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Login failed"
 *               code: "LOGIN_ERROR"
 */
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

      res.json({
        message: "Login successful",
        user: {
          id: result.user.id,
          email: result.user.email,
          createdAt: result.user.createdAt,
        },
        tokens: result.tokens,
      });
    } catch (error) {
      logger.error("Login endpoint error", {
        error: error instanceof Error ? error.message : "Unknown error",
        body: req.body,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });

      if (error instanceof Error && error.message === "Invalid credentials") {
        return res.status(401).json({
          error: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        });
      }

      res.status(500).json({
        error: "Login failed",
        code: "LOGIN_ERROR",
      });
    }
  },
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Get new access token using refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tokens refreshed successfully"
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       401:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Invalid refresh token"
 *               code: "INVALID_REFRESH_TOKEN"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Token refresh failed"
 *               code: "REFRESH_ERROR"
 */
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

      res.json({
        message: "Tokens refreshed successfully",
        tokens,
      });
    } catch (error) {
      logger.error("Token refresh endpoint error", {
        error: error instanceof Error ? error.message : "Unknown error",
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });

      if (error instanceof Error && error.message === "Invalid refresh token") {
        return res.status(401).json({
          error: "Invalid refresh token",
          code: "INVALID_REFRESH_TOKEN",
        });
      }

      res.status(500).json({
        error: "Token refresh failed",
        code: "REFRESH_ERROR",
      });
    }
  },
);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     description: Change the password for the authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *           example:
 *             currentPassword: "oldpassword123"
 *             newPassword: "newpassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Password changed successfully"
 *       400:
 *         description: Invalid current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Current password is incorrect"
 *               code: "INVALID_CURRENT_PASSWORD"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "User not found"
 *               code: "USER_NOT_FOUND"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Password change failed"
 *               code: "PASSWORD_CHANGE_ERROR"
 */
// Change password endpoint
router.post(
  "/change-password",
  authenticateToken,
  validate(authSchemas.changePassword),
  async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;

      await authService.changePassword(userId, currentPassword, newPassword);

      logger.info("Password change successful", {
        userId,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json({
        message: "Password changed successfully",
      });
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
        return res.status(400).json({
          error: "Current password is incorrect",
          code: "INVALID_CURRENT_PASSWORD",
        });
      }

      if (error instanceof Error && error.message === "User not found") {
        return res.status(404).json({
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      res.status(500).json({
        error: "Password change failed",
        code: "PASSWORD_CHANGE_ERROR",
      });
    }
  },
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout the authenticated user and invalidate tokens
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Logout successful"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Logout failed"
 *               code: "LOGOUT_ERROR"
 */
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

      res.json({
        message: "Logout successful",
      });
    } catch (error) {
      logger.error("Logout endpoint error", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.status(500).json({
        error: "Logout failed",
        code: "LOGOUT_ERROR",
      });
    }
  },
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Get the profile information of the authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               user:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 email: "user@example.com"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Failed to get user profile"
 *               code: "PROFILE_ERROR"
 */
// Get current user profile
router.get("/me", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    logger.info("User profile accessed", {
      userId: user.id,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    logger.error("Get profile endpoint error", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(500).json({
      error: "Failed to get user profile",
      code: "PROFILE_ERROR",
    });
  }
});

export default router;
