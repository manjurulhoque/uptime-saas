import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

// Import custom modules
import logger from "./config/logger";
// import { morganStream } from "./config/logger";
import {
    corsOptions,
    generalRateLimit,
    requestLogger,
} from "./middleware/security";
import { errorHandler, notFoundHandler } from "./middleware/validation";
import authRoutes from "./routes/auth";
import monitorsRoutes from "./routes/monitors";
import { swaggerSpec } from "./config/swagger";
import monitoringService from "./services/monitoringService";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(generalRateLimit);

// Body parsing middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
// app.use(morgan("combined", { stream: morganStream }));
app.use(requestLogger);


app.get("/", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
    });
});


// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
    });
});

// Swagger documentation
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: ".swagger-ui .topbar { display: none }",
        customCssUrl:
            "https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-material.css",
        customSiteTitle: "Uptime SaaS API Documentation",
    }),
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/monitors", monitorsRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    logger.info(`🚀 Server is running on http://localhost:${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
        nodeVersion: process.version,
    });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, shutting down gracefully");
    await monitoringService.shutdown();
    process.exit(0);
});

process.on("SIGINT", async () => {
    logger.info("SIGINT received, shutting down gracefully");
    await monitoringService.shutdown();
    process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception", {
        error: error.message,
        stack: error.stack,
    });
    process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection", {
        reason: reason instanceof Error ? reason.message : reason,
        stack: reason instanceof Error ? reason.stack : undefined,
        promise: promise.toString(),
    });
    process.exit(1);
});
