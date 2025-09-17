import { Router, Request, Response } from "express";
import logger from "../config/logger";
import { authenticateToken } from "../middleware/auth";
import { validate, monitorSchemas } from "../middleware/validation";
import { MonitorExistsError, InternalServerError } from "../utils/errors";
import prisma from "../db";

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

export default router;
