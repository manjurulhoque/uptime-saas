import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db";
import logger from "../config/logger";

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
            };
        }
    }
}

interface JwtPayload {
    userId: number;
    email: string;
    iat: number;
    exp: number;
}

export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

        if (!token) {
            logger.warn("Authentication failed: No token provided", {
                ip: req.ip,
                userAgent: req.get("User-Agent"),
                path: req.path,
            });
            return res.status(401).json({
                error: "Access denied. No token provided.",
                code: "NO_TOKEN",
            });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            logger.error("JWT_SECRET not configured");
            return res.status(500).json({
                error: "Server configuration error",
                code: "CONFIG_ERROR",
            });
        }

        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        // Verify user still exists in database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true },
        });

        if (!user) {
            logger.warn("Authentication failed: User not found", {
                userId: decoded.userId,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
                path: req.path,
            });
            return res.status(401).json({
                error: "Invalid token. User not found.",
                code: "USER_NOT_FOUND",
            });
        }

        req.user = user;
        logger.info("User authenticated successfully", {
            userId: user.id,
            email: user.email,
            ip: req.ip,
            path: req.path,
        });

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            logger.warn("Authentication failed: Invalid token", {
                error: error.message,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
                path: req.path,
            });
            return res.status(401).json({
                error: "Invalid token.",
                code: "INVALID_TOKEN",
            });
        }

        if (error instanceof jwt.TokenExpiredError) {
            logger.warn("Authentication failed: Token expired", {
                ip: req.ip,
                userAgent: req.get("User-Agent"),
                path: req.path,
            });
            return res.status(401).json({
                error: "Token expired.",
                code: "TOKEN_EXPIRED",
            });
        }

        logger.error("Authentication error", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            ip: req.ip,
            path: req.path,
        });

        return res.status(500).json({
            error: "Internal server error during authentication",
            code: "AUTH_ERROR",
        });
    }
};

export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return next();
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return next();
        }

        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true },
        });

        if (user) {
            req.user = user;
        }

        next();
    } catch (error) {
        // For optional auth, we just continue without setting req.user
        next();
    }
};
