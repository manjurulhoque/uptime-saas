import { Router, Request, Response } from "express";
import logger from "../config/logger";
import { authenticateToken } from "../middleware/auth";
import prisma from "../db";

const router = Router();

/**
 * @swagger
 * /api/monitors:
 *   get:
 *     summary: Get all monitors
 *     description: Get all monitors for the authenticated user
 *     tags: [Monitors]
 */
router.get("/", authenticateToken, async (req: Request, res: Response) => {
    try {
        const monitors = await prisma.monitor.findMany({
            where: { userId: req.user?.id },
        });
    } catch (error) {
        logger.error("Get monitors endpoint error", {
            error: error instanceof Error ? error.message : "Unknown error",
            userId: req.user?.id,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
        });
    }
});

export default router;