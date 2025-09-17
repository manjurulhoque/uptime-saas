import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db";
import logger from "../config/logger";

interface RegisterData {
    email: string;
    password: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

interface User {
    id: number;
    email: string;
    createdAt: Date;
}

class AuthService {
    private readonly saltRounds = 12;
    private readonly accessTokenExpiry = "1d";
    private readonly refreshTokenExpiry = "7d";

    private generateTokens(userId: number, email: string): TokenPair {
        const jwtSecret = process.env.JWT_SECRET;
        const refreshSecret = process.env.JWT_REFRESH_SECRET;

        if (!jwtSecret || !refreshSecret) {
            throw new Error("JWT secrets not configured");
        }

        const accessToken = jwt.sign({ userId, email }, jwtSecret, {
            expiresIn: this.accessTokenExpiry,
        });

        const refreshToken = jwt.sign({ userId, email }, refreshSecret, {
            expiresIn: this.refreshTokenExpiry,
        });

        return { accessToken, refreshToken };
    }

    async register(
        data: RegisterData
    ): Promise<{ user: User; tokens: TokenPair }> {
        try {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email },
            });

            if (existingUser) {
                logger.warn("Registration attempt with existing email", {
                    email: data.email,
                });
                throw new Error("User with this email already exists");
            }

            // Hash password
            const passwordHash = await bcrypt.hash(
                data.password,
                this.saltRounds
            );

            // Create user
            const user = await prisma.user.create({
                data: {
                    email: data.email,
                    passwordHash,
                },
                select: {
                    id: true,
                    email: true,
                    createdAt: true,
                },
            });

            // Generate tokens
            const tokens = this.generateTokens(user.id, user.email);

            logger.info("User registered successfully", {
                userId: user.id,
                email: user.email,
            });

            return { user, tokens };
        } catch (error) {
            logger.error("Registration failed", {
                error: error instanceof Error ? error.message : "Unknown error",
                email: data.email,
            });
            throw error;
        }
    }

    async login(data: LoginData): Promise<{ user: User; tokens: TokenPair }> {
        try {
            // Find user
            const user = await prisma.user.findUnique({
                where: { email: data.email },
            });

            if (!user) {
                logger.warn("Login attempt with non-existent email", {
                    email: data.email,
                });
                throw new Error("Invalid credentials");
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(
                data.password,
                user.passwordHash
            );

            if (!isValidPassword) {
                logger.warn("Login attempt with invalid password", {
                    userId: user.id,
                    email: data.email,
                });
                throw new Error("Invalid credentials");
            }

            // Generate tokens
            const tokens = this.generateTokens(user.id, user.email);

            logger.info("User logged in successfully", {
                userId: user.id,
                email: user.email,
            });

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    createdAt: user.createdAt,
                },
                tokens,
            };
        } catch (error) {
            logger.error("Login failed", {
                error: error instanceof Error ? error.message : "Unknown error",
                email: data.email,
            });
            throw error;
        }
    }

    async refreshToken(refreshToken: string): Promise<TokenPair> {
        try {
            const refreshSecret = process.env.JWT_REFRESH_SECRET;

            if (!refreshSecret) {
                throw new Error("JWT refresh secret not configured");
            }

            // Verify refresh token
            const decoded = jwt.verify(
                refreshToken,
                refreshSecret
            ) as jwt.JwtPayload;

            // Check if user still exists
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true },
            });

            if (!user) {
                logger.warn("Refresh token for non-existent user", {
                    userId: decoded.userId,
                });
                throw new Error("Invalid refresh token");
            }

            // Generate new tokens
            const tokens = this.generateTokens(user.id, user.email);

            logger.info("Tokens refreshed successfully", {
                userId: user.id,
                email: user.email,
            });

            return tokens;
        } catch (error) {
            logger.error("Token refresh failed", {
                error: error instanceof Error ? error.message : "Unknown error",
            });
            throw error;
        }
    }

    async changePassword(
        userId: number,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        try {
            // Get user with password hash
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                throw new Error("User not found");
            }

            // Verify current password
            const isValidPassword = await bcrypt.compare(
                currentPassword,
                user.passwordHash
            );

            if (!isValidPassword) {
                logger.warn(
                    "Password change attempt with invalid current password",
                    {
                        userId,
                    }
                );
                throw new Error("Current password is incorrect");
            }

            // Hash new password
            const newPasswordHash = await bcrypt.hash(
                newPassword,
                this.saltRounds
            );

            // Update password
            await prisma.user.update({
                where: { id: userId },
                data: { passwordHash: newPasswordHash },
            });

            logger.info("Password changed successfully", {
                userId,
            });
        } catch (error) {
            logger.error("Password change failed", {
                error: error instanceof Error ? error.message : "Unknown error",
                userId,
            });
            throw error;
        }
    }

    async logout(userId: number): Promise<void> {
        // In a more sophisticated implementation, you might want to:
        // 1. Store refresh tokens in a database and invalidate them
        // 2. Use a token blacklist
        // 3. Implement token revocation

        logger.info("User logged out", {
            userId,
        });
    }
}

export default new AuthService();
