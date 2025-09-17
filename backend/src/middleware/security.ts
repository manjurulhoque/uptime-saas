import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import logger from "../config/logger";

// CORS configuration
export const corsOptions = {
    origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
    ) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
            "http://localhost:3000",
        ];

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.warn("CORS blocked request", { origin });
            callback(new Error("Not allowed by CORS"), false);
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        error: "Too many authentication attempts, please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        logger.warn("Rate limit exceeded for auth endpoints", {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            path: req.path,
        });
        res.status(429).json({
            error: "Too many authentication attempts, please try again later.",
            code: "RATE_LIMIT_EXCEEDED",
        });
    },
});

// General rate limiting
export const generalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: "Too many requests, please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        logger.warn("Rate limit exceeded for general endpoints", {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            path: req.path,
        });
        res.status(429).json({
            error: "Too many requests, please try again later.",
            code: "RATE_LIMIT_EXCEEDED",
        });
    },
});

// Security headers middleware
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
});

// Request logging middleware
export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;

        logger.info("HTTP Request", {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            contentLength: res.get("Content-Length"),
        });
    });

    next();
};

// IP whitelist middleware (optional)
export const ipWhitelist = (allowedIPs: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const clientIP = req.ip || req.connection.remoteAddress;

        if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP!)) {
            logger.warn("IP not in whitelist", {
                ip: clientIP,
                userAgent: req.get("User-Agent"),
                path: req.path,
            });

            return res.status(403).json({
                error: "Access denied",
                code: "IP_NOT_ALLOWED",
            });
        }

        next();
    };
};
