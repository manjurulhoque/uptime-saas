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

/**
 * @swagger
 * /api/monitors:
 *   get:
 *     summary: Get all monitors
 *     description: Get all monitors for the authenticated user
 *     tags: [Monitors]
 *     responses:
 *       200:
 *         description: Monitors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Monitor'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 *               code: "INTERNAL_SERVER_ERROR"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *               code: "UNAUTHORIZED"
 */
router.get("/", authenticateToken, async (req: Request, res: Response) => {
    try {
        const monitors = await prisma.monitor.findMany({
            where: { userId: req.user?.id },
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

/**
 * @swagger
 * /api/monitors:
 *   post:
 *     summary: Create a new monitor
 *     description: Create a new monitor for the authenticated user
 *     tags: [Monitors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Monitor'
 *           example:
 *             url: "https://www.google.com"
 *             interval: 5
 *     responses:
 *       201:
 *         description: Monitor created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Monitor'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 *               code: "INTERNAL_SERVER_ERROR"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *               code: "UNAUTHORIZED"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Invalid input data"
 *               code: "INVALID_INPUT_DATA"
 *       409:
 *         description: Monitor already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Monitor already exists"
 *               code: "MONITOR_EXISTS"
 */
router.post(
    "/",
    authenticateToken,
    validate(monitorSchemas.create),
    async (req: Request, res: Response) => {
        try {
            const { url, interval } = req.body;

            const existingMonitor = await prisma.monitor.findFirst({
                where: { url, userId: req.user?.id as number },
            });

            if (existingMonitor) {
                throw new MonitorExistsError();
            }

            const monitor = await prisma.monitor.create({
                data: {
                    url,
                    interval,
                    userId: req.user!.id,
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

router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
        const monitor = await prisma.monitor.findUnique({
            where: { id: parseInt(req.params.id), userId: req.user?.id },
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

router.put("/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
        const { url, interval } = req.body;

        const existingMonitor = await prisma.monitor.findFirst({
            where: {
                id: parseInt(req.params.id),
                userId: req.user?.id as number,
            },
        });

        if (!existingMonitor) {
            throw new MonitorNotFoundError("Monitor not found");
        }

        if (existingMonitor.url !== url) {
            const existingMonitorWithSameUrl = await prisma.monitor.findFirst({
                where: { url, userId: req.user?.id as number },
            });

            if (existingMonitorWithSameUrl) {
                throw new MonitorExistsError(
                    "Monitor with same URL already exists",
                );
            }
        }

        const monitor = await prisma.monitor.update({
            where: { id: parseInt(req.params.id), userId: req.user?.id },
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

/**
 * @swagger
 * /api/monitors/{id}/delete:
 *   delete:
 *     summary: Delete a monitor
 *     description: Delete a monitor and stop its monitoring
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Monitor ID
 *     responses:
 *       200:
 *         description: Monitor deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Monitor deleted successfully"
 *       404:
 *         description: Monitor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Monitor not found"
 *               code: "MONITOR_NOT_FOUND"
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
 */
router.delete(
    "/:id",
    authenticateToken,
    async (req: Request, res: Response) => {
        try {
            const monitorId = parseInt(req.params.id);

            const existingMonitor = await prisma.monitor.findFirst({
                where: { id: monitorId, userId: req.user?.id as number },
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

/**
 * @swagger
 * /api/monitors/{id}/stats:
 *   get:
 *     summary: Get monitor statistics
 *     description: Get uptime statistics and performance data for a monitor
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Monitor ID
 *       - in: query
 *         name: days
 *         required: false
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to include in statistics
 *     responses:
 *       200:
 *         description: Monitor statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalChecks:
 *                       type: integer
 *                     upChecks:
 *                       type: integer
 *                     downChecks:
 *                       type: integer
 *                     uptimePercentage:
 *                       type: number
 *                     avgResponseTime:
 *                       type: number
 *                     incidents:
 *                       type: integer
 *                     lastCheck:
 *                       type: string
 *                       format: date-time
 *                     lastIncident:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Monitor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 */
router.get(
    "/:id/stats",
    authenticateToken,
    async (req: Request, res: Response) => {
        try {
            const monitorId = parseInt(req.params.id);
            const days = parseInt(req.query.days as string) || 30;

            // Verify monitor belongs to user
            const monitor = await prisma.monitor.findFirst({
                where: { id: monitorId, userId: req.user?.id as number },
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

/**
 * @swagger
 * /api/monitors/{id}/checks:
 *   get:
 *     summary: Get monitor check history
 *     description: Get recent check results for a monitor
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Monitor ID
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of checks to return
 *     responses:
 *       200:
 *         description: Monitor checks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     checks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           status:
 *                             type: string
 *                           statusCode:
 *                             type: integer
 *                           responseTime:
 *                             type: integer
 *                           errorMessage:
 *                             type: string
 *                           checkedAt:
 *                             type: string
 *                             format: date-time
 *       404:
 *         description: Monitor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 */
router.get(
    "/:id/checks",
    authenticateToken,
    async (req: Request, res: Response) => {
        try {
            const monitorId = parseInt(req.params.id);
            const limit = parseInt(req.query.limit as string) || 100;

            // Verify monitor belongs to user
            const monitor = await prisma.monitor.findFirst({
                where: { id: monitorId, userId: req.user?.id as number },
            });

            if (!monitor) {
                throw new MonitorNotFoundError("Monitor not found");
            }

            const checks = await prisma.monitorCheck.findMany({
                where: { monitorId },
                orderBy: { checkedAt: "desc" },
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

/**
 * @swagger
 * /api/monitors/{id}/incidents:
 *   get:
 *     summary: Get monitor incidents
 *     description: Get incident history for a monitor
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Monitor ID
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of incidents to return
 *     responses:
 *       200:
 *         description: Monitor incidents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     incidents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           status:
 *                             type: string
 *                           startedAt:
 *                             type: string
 *                             format: date-time
 *                           endedAt:
 *                             type: string
 *                             format: date-time
 *                           duration:
 *                             type: integer
 *                           description:
 *                             type: string
 *       404:
 *         description: Monitor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 */
router.get(
    "/:id/incidents",
    authenticateToken,
    async (req: Request, res: Response) => {
        try {
            const monitorId = parseInt(req.params.id);
            const limit = parseInt(req.query.limit as string) || 50;

            // Verify monitor belongs to user
            const monitor = await prisma.monitor.findFirst({
                where: { id: monitorId, userId: req.user?.id as number },
            });

            if (!monitor) {
                throw new MonitorNotFoundError("Monitor not found");
            }

            const incidents = await prisma.incident.findMany({
                where: { monitorId },
                orderBy: { startedAt: "desc" },
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
