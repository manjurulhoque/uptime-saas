import { Router, Request, Response } from "express";
import logger from "../config/logger";
import { authenticateToken } from "../middleware/auth";
import { validate, monitorSchemas } from "../middleware/validation";
import {
    MonitorExistsError,
    InternalServerError,
    MonitorNotFoundError,
} from "../utils/errors";
import prisma from "../db";
import monitoringService from "../services/monitoringService";

const router = Router();

router.get("/", authenticateToken, async (req: Request, res: Response) => {
    try {
        const monitors = await prisma.monitor.findMany({
            where: { user_id: req.user?.id },
        });
        res.status(200).json({ data: { monitors } });
    } catch (error) {
        logger.error("Get monitors endpoint error", {
            error: error instanceof Error ? error.message : "Unknown error",
            userId: req.user?.id,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        });

        if (error instanceof InternalServerError) {
            return res.status(error.statusCode).json({
                error: error.message,
                code: error.code,
            });
        }

        res.status(500).json({
            error: "Internal server error",
            code: "INTERNAL_SERVER_ERROR",
        });
    }
});

// create new monitor
router.post(
    "/",
    authenticateToken,
    validate(monitorSchemas.create),
    async (req: Request, res: Response) => {
        try {
            const { url, interval } = req.body;

            const existingMonitor = await prisma.monitor.findFirst({
                where: { url, user_id: req.user?.id as number },
            });

            if (existingMonitor) {
                throw new MonitorExistsError();
            }

            const monitor = await prisma.monitor.create({
                data: {
                    url,
                    interval,
                    user_id: req.user!.id,
                },
            });

            // Start monitoring for the new monitor
            await monitoringService.startMonitoring(monitor.id);

            logger.info("Monitor created successfully", {
                monitorId: monitor.id,
                userId: req.user?.id,
                url: monitor.url,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            res.status(201).json({
                message: "Monitor created successfully",
                data: { monitor },
            });
        } catch (error) {
            logger.error("Create monitor endpoint error", {
                error: error instanceof Error ? error.message : "Unknown error",
                userId: req.user?.id,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            if (error instanceof MonitorExistsError) {
                return res.status(error.statusCode).json({
                    error: error.message,
                    code: error.code,
                });
            }

            if (error instanceof InternalServerError) {
                return res.status(error.statusCode).json({
                    error: error.message,
                    code: error.code,
                });
            }

            res.status(500).json({
                error: "Internal server error",
                code: "INTERNAL_SERVER_ERROR",
            });
        }
    },
);

// get monitor by id
router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
        const monitor = await prisma.monitor.findUnique({
            where: { id: parseInt(req.params.id), user_id: req.user?.id },
        });

        if (!monitor) {
            throw new MonitorNotFoundError();
        }

        res.status(200).json({ data: { monitor } });
    } catch (error) {
        logger.error("Get monitor endpoint error", {
            error: error instanceof Error ? error.message : "Unknown error",
            userId: req.user?.id,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        });

        if (error instanceof MonitorNotFoundError) {
            return res.status(error.statusCode).json({
                error: error.message,
                code: error.code,
            });
        }

        res.status(500).json({
            error: "Internal server error",
            code: "INTERNAL_SERVER_ERROR",
        });
    }
});

// update monitor
router.put("/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
        const { url, interval, } = req.body;

        const existingMonitor = await prisma.monitor.findFirst({
            where: {
                id: parseInt(req.params.id),
                user_id: req.user?.id as number,
            },
        });

        if (!existingMonitor) {
            throw new MonitorNotFoundError("Monitor not found");
        }

        if (existingMonitor.url !== url) {
            const existingMonitorWithSameUrl = await prisma.monitor.findFirst({
                where: { url, user_id: req.user?.id as number },
            });

            if (existingMonitorWithSameUrl) {
                throw new MonitorExistsError(
                    "Monitor with same URL already exists",
                );
            }
        }

        const monitor = await prisma.monitor.update({
            where: { id: parseInt(req.params.id), user_id: req.user?.id },
            data: { url, interval },
        });

        // Update monitoring job if interval changed
        await monitoringService.updateMonitoring(monitor.id);

        logger.info("Monitor updated successfully", {
            monitorId: monitor.id,
            userId: req.user?.id,
            url: monitor.url,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        });

        res.status(200).json({ data: { monitor } });
    } catch (error) {
        logger.error("Update monitor endpoint error", {
            error: error instanceof Error ? error.message : "Unknown error",
            userId: req.user?.id,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        });

        if (error instanceof MonitorNotFoundError) {
            return res.status(error.statusCode).json({
                error: error.message,
                code: error.code,
            });
        }

        if (error instanceof InternalServerError) {
            return res.status(error.statusCode).json({
                error: error.message,
                code: error.code,
            });
        }

        res.status(500).json({
            error: "Internal server error",
            code: "INTERNAL_SERVER_ERROR",
        });
    }
});

// update monitor status
router.put("/:id/status", authenticateToken, async (req: Request, res: Response) => {
    try {
        const { isActive } = req.body;

        const monitor = await prisma.monitor.update({
            where: { id: parseInt(req.params.id), user_id: req.user?.id },
            data: { is_active: isActive },
        });

        await monitoringService.updateMonitoring(monitor.id);

        logger.info("Monitor status updated successfully", {
            monitorId: monitor.id,
            userId: req.user?.id,
            is_active: isActive,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        });
        
        res.status(200).json({ data: { monitor } });
    } catch (error) {
        logger.error("Update monitor status endpoint error", {
            error: error instanceof Error ? error.message : "Unknown error",
            userId: req.user?.id,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        });

        res.status(500).json({
            error: "Internal server error",
            code: "INTERNAL_SERVER_ERROR",
        });
    }
});

// delete monitor
router.delete(
    "/:id",
    authenticateToken,
    async (req: Request, res: Response) => {
        try {
            const monitorId = parseInt(req.params.id);

            const existingMonitor = await prisma.monitor.findFirst({
                where: { id: monitorId, user_id: req.user?.id as number },
            });

            if (!existingMonitor) {
                throw new MonitorNotFoundError("Monitor not found");
            }

            // Stop monitoring
            await monitoringService.stopMonitoring(monitorId);

            // Delete monitor (cascade will delete checks and incidents)
            await prisma.monitor.delete({
                where: { id: monitorId },
            });

            logger.info("Monitor deleted successfully", {
                monitorId,
                userId: req.user?.id,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            res.status(200).json({
                message: "Monitor deleted successfully",
            });
        } catch (error) {
            logger.error("Delete monitor endpoint error", {
                error: error instanceof Error ? error.message : "Unknown error",
                userId: req.user?.id,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            if (error instanceof MonitorNotFoundError) {
                return res.status(error.statusCode).json({
                    error: error.message,
                    code: error.code,
                });
            }

            res.status(500).json({
                error: "Internal server error",
                code: "INTERNAL_SERVER_ERROR",
            });
        }
    },
);

// get monitor stats
router.get(
    "/:id/stats",
    authenticateToken,
    async (req: Request, res: Response) => {
        try {
            const monitorId = parseInt(req.params.id);
            const days = parseInt(req.query.days as string) || 30;

            // Verify monitor belongs to user
            const monitor = await prisma.monitor.findFirst({
                where: { id: monitorId, user_id: req.user?.id as number },
            });

            if (!monitor) {
                throw new MonitorNotFoundError("Monitor not found");
            }

            const stats = await monitoringService.getMonitorStats(
                monitorId,
                days,
            );

            res.status(200).json({
                data: { stats },
            });
        } catch (error) {
            logger.error("Get monitor stats endpoint error", {
                error: error instanceof Error ? error.message : "Unknown error",
                userId: req.user?.id,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            if (error instanceof MonitorNotFoundError) {
                return res.status(error.statusCode).json({
                    error: error.message,
                    code: error.code,
                });
            }

            res.status(500).json({
                error: "Internal server error",
                code: "INTERNAL_SERVER_ERROR",
            });
        }
    },
);

// get monitor checks
router.get(
    "/:id/checks",
    authenticateToken,
    async (req: Request, res: Response) => {
        try {
            const monitorId = parseInt(req.params.id);
            const limit = parseInt(req.query.limit as string) || 100;

            // Verify monitor belongs to user
            const monitor = await prisma.monitor.findFirst({
                where: { id: monitorId, user_id: req.user?.id as number },
            });

            if (!monitor) {
                throw new MonitorNotFoundError("Monitor not found");
            }

            const checks = await prisma.monitorCheck.findMany({
                where: { monitor_id: monitorId },
                orderBy: { checked_at: "desc" },
                take: limit,
            });

            res.status(200).json({
                data: { checks },
            });
        } catch (error) {
            logger.error("Get monitor checks endpoint error", {
                error: error instanceof Error ? error.message : "Unknown error",
                userId: req.user?.id,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            if (error instanceof MonitorNotFoundError) {
                return res.status(error.statusCode).json({
                    error: error.message,
                    code: error.code,
                });
            }

            res.status(500).json({
                error: "Internal server error",
                code: "INTERNAL_SERVER_ERROR",
            });
        }
    },
);

// get monitor incidents
router.get(
    "/:id/incidents",
    authenticateToken,
    async (req: Request, res: Response) => {
        try {
            const monitorId = parseInt(req.params.id);
            const limit = parseInt(req.query.limit as string) || 50;

            // Verify monitor belongs to user
            const monitor = await prisma.monitor.findFirst({
                where: { id: monitorId, user_id: req.user?.id as number },
            });

            if (!monitor) {
                throw new MonitorNotFoundError("Monitor not found");
            }

            const incidents = await prisma.incident.findMany({
                where: { monitor_id: monitorId },
                orderBy: { started_at: "desc" },
                take: limit,
            });

            res.status(200).json({
                data: { incidents },
            });
        } catch (error) {
            logger.error("Get monitor incidents endpoint error", {
                error: error instanceof Error ? error.message : "Unknown error",
                userId: req.user?.id,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            if (error instanceof MonitorNotFoundError) {
                return res.status(error.statusCode).json({
                    error: error.message,
                    code: error.code,
                });
            }

            res.status(500).json({
                error: "Internal server error",
                code: "INTERNAL_SERVER_ERROR",
            });
        }
    },
);

export default router;
