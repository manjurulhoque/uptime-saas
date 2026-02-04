import { Router, Request, Response } from "express";
import { requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validation";
import prisma from "../db";
import logger from "../config/logger";
import { successResponse, errorResponse } from "../utils/response";
import bcrypt from "bcryptjs";
import { z } from "zod";

const router = Router();

// Validation schemas
const updateUserSchema = z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email().optional(),
    is_active: z.boolean().optional(),
    is_admin: z.boolean().optional(),
});

const createUserSchema = z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6),
    is_active: z.boolean().optional().default(true),
    is_admin: z.boolean().optional().default(false),
});

// Get all users
router.get("/users", requireAdmin, async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20, search = "" } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        if (search) {
            where.OR = [
                { email: { contains: search as string, mode: "insensitive" } },
                { first_name: { contains: search as string, mode: "insensitive" } },
                { last_name: { contains: search as string, mode: "insensitive" } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    is_active: true,
                    is_admin: true,
                    last_login_at: true,
                    created_at: true,
                    updated_at: true,
                    _count: {
                        select: {
                            monitors: true,
                        },
                    },
                },
                skip,
                take: limitNum,
                orderBy: { created_at: "desc" },
            }),
            prisma.user.count({ where }),
        ]);

        logger.info("Admin fetched users list", {
            adminId: req.user?.id,
            page: pageNum,
            limit: limitNum,
            total,
        });

        res.status(200).json(
            successResponse({
                users,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            })
        );
    } catch (error) {
        logger.error("Admin get users error", {
            error: error instanceof Error ? error.message : "Unknown error",
            adminId: req.user?.id,
        });
        res.status(500).json(errorResponse("Failed to fetch users", "FETCH_USERS_ERROR"));
    }
});

// Get single user
router.get("/users/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id, 10);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                is_active: true,
                is_admin: true,
                last_login_at: true,
                created_at: true,
                updated_at: true,
                monitors: {
                    select: {
                        id: true,
                        url: true,
                        interval: true,
                        last_status: true,
                        last_checked_at: true,
                        is_active: true,
                        created_at: true,
                    },
                },
                _count: {
                    select: {
                        monitors: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json(errorResponse("User not found", "USER_NOT_FOUND"));
        }

        logger.info("Admin fetched user details", {
            adminId: req.user?.id,
            userId,
        });

        res.status(200).json(successResponse({ user }));
    } catch (error) {
        logger.error("Admin get user error", {
            error: error instanceof Error ? error.message : "Unknown error",
            adminId: req.user?.id,
            userId: req.params.id,
        });
        res.status(500).json(errorResponse("Failed to fetch user", "FETCH_USER_ERROR"));
    }
});

// Create user
router.post(
    "/users",
    requireAdmin,
    validate(createUserSchema),
    async (req: Request, res: Response) => {
        try {
            const { first_name, last_name, email, password, is_active, is_admin } = req.body;

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return res.status(409).json(errorResponse("User with this email already exists", "USER_EXISTS"));
            }

            // Hash password
            const password_hash = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: {
                    first_name,
                    last_name,
                    email,
                    password_hash,
                    is_active: is_active ?? true,
                    is_admin: is_admin ?? false,
                },
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    is_active: true,
                    is_admin: true,
                    created_at: true,
                },
            });

            logger.info("Admin created user", {
                adminId: req.user?.id,
                userId: user.id,
                email: user.email,
            });

            res.status(201).json(successResponse({ user }));
        } catch (error) {
            logger.error("Admin create user error", {
                error: error instanceof Error ? error.message : "Unknown error",
                adminId: req.user?.id,
            });
            res.status(500).json(errorResponse("Failed to create user", "CREATE_USER_ERROR"));
        }
    }
);

// Update user
router.put(
    "/users/:id",
    requireAdmin,
    validate(updateUserSchema),
    async (req: Request, res: Response) => {
        try {
            const userId = parseInt(req.params.id, 10);
            const { first_name, last_name, email, is_active, is_admin } = req.body;

            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!existingUser) {
                return res.status(404).json(errorResponse("User not found", "USER_NOT_FOUND"));
            }

            // Check if email is being changed and if it's already taken
            if (email && email !== existingUser.email) {
                const emailExists = await prisma.user.findUnique({
                    where: { email },
                });

                if (emailExists) {
                    return res.status(409).json(errorResponse("Email already exists", "EMAIL_EXISTS"));
                }
            }

            // Prevent admin from removing their own admin status
            if (req.user?.id === userId && is_admin === false) {
                return res.status(400).json(errorResponse("Cannot remove your own admin status", "CANNOT_REMOVE_ADMIN"));
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    ...(first_name !== undefined && { first_name }),
                    ...(last_name !== undefined && { last_name }),
                    ...(email !== undefined && { email }),
                    ...(is_active !== undefined && { is_active }),
                    ...(is_admin !== undefined && { is_admin }),
                },
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    is_active: true,
                    is_admin: true,
                    updated_at: true,
                },
            });

            logger.info("Admin updated user", {
                adminId: req.user?.id,
                userId,
                updatedFields: Object.keys(req.body),
            });

            res.status(200).json(successResponse({ user: updatedUser }));
        } catch (error) {
            logger.error("Admin update user error", {
                error: error instanceof Error ? error.message : "Unknown error",
                adminId: req.user?.id,
                userId: req.params.id,
            });
            res.status(500).json(errorResponse("Failed to update user", "UPDATE_USER_ERROR"));
        }
    }
);

// Delete user
router.delete("/users/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id, 10);

        // Prevent admin from deleting themselves
        if (req.user?.id === userId) {
            return res.status(400).json(errorResponse("Cannot delete your own account", "CANNOT_DELETE_SELF"));
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json(errorResponse("User not found", "USER_NOT_FOUND"));
        }

        // Delete user (cascade will delete monitors)
        await prisma.user.delete({
            where: { id: userId },
        });

        logger.info("Admin deleted user", {
            adminId: req.user?.id,
            userId,
            email: user.email,
        });

        res.status(200).json(successResponse({ message: "User deleted successfully" }));
    } catch (error) {
        logger.error("Admin delete user error", {
            error: error instanceof Error ? error.message : "Unknown error",
            adminId: req.user?.id,
            userId: req.params.id,
        });
        res.status(500).json(errorResponse("Failed to delete user", "DELETE_USER_ERROR"));
    }
});

// Get all monitors (admin view)
router.get("/monitors", requireAdmin, async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20, search = "", user_id, status } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        if (search) {
            where.url = { contains: search as string, mode: "insensitive" };
        }

        if (user_id) {
            where.user_id = parseInt(user_id as string, 10);
        }

        if (status) {
            where.last_status = status as string;
        }

        const [monitors, total] = await Promise.all([
            prisma.monitor.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            first_name: true,
                            last_name: true,
                        },
                    },
                    _count: {
                        select: {
                            checks: true,
                            incidents: true,
                        },
                    },
                },
                skip,
                take: limitNum,
                orderBy: { created_at: "desc" },
            }),
            prisma.monitor.count({ where }),
        ]);

        logger.info("Admin fetched monitors list", {
            adminId: req.user?.id,
            page: pageNum,
            limit: limitNum,
            total,
        });

        res.status(200).json(
            successResponse({
                monitors,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            })
        );
    } catch (error) {
        logger.error("Admin get monitors error", {
            error: error instanceof Error ? error.message : "Unknown error",
            adminId: req.user?.id,
        });
        res.status(500).json(errorResponse("Failed to fetch monitors", "FETCH_MONITORS_ERROR"));
    }
});

// Get single monitor (admin view)
router.get("/monitors/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
        const monitorId = parseInt(req.params.id, 10);

        const monitor = await prisma.monitor.findUnique({
            where: { id: monitorId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                checks: {
                    take: 10,
                    orderBy: { checked_at: "desc" },
                },
                incidents: {
                    take: 10,
                    orderBy: { started_at: "desc" },
                },
            },
        });

        if (!monitor) {
            return res.status(404).json(errorResponse("Monitor not found", "MONITOR_NOT_FOUND"));
        }

        logger.info("Admin fetched monitor details", {
            adminId: req.user?.id,
            monitorId,
        });

        res.status(200).json(successResponse({ monitor }));
    } catch (error) {
        logger.error("Admin get monitor error", {
            error: error instanceof Error ? error.message : "Unknown error",
            adminId: req.user?.id,
            monitorId: req.params.id,
        });
        res.status(500).json(errorResponse("Failed to fetch monitor", "FETCH_MONITOR_ERROR"));
    }
});

// Delete monitor (admin)
router.delete("/monitors/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
        const monitorId = parseInt(req.params.id, 10);

        const monitor = await prisma.monitor.findUnique({
            where: { id: monitorId },
        });

        if (!monitor) {
            return res.status(404).json(errorResponse("Monitor not found", "MONITOR_NOT_FOUND"));
        }

        // Stop monitoring if active
        const monitoringService = (await import("../services/monitoringService")).default;
        await monitoringService.stopMonitoring(monitorId);

        // Delete monitor (cascade will delete checks, incidents, notifications)
        await prisma.monitor.delete({
            where: { id: monitorId },
        });

        logger.info("Admin deleted monitor", {
            adminId: req.user?.id,
            monitorId,
            url: monitor.url,
        });

        res.status(200).json(successResponse({ message: "Monitor deleted successfully" }));
    } catch (error) {
        logger.error("Admin delete monitor error", {
            error: error instanceof Error ? error.message : "Unknown error",
            adminId: req.user?.id,
            monitorId: req.params.id,
        });
        res.status(500).json(errorResponse("Failed to delete monitor", "DELETE_MONITOR_ERROR"));
    }
});

// Get dashboard stats
router.get("/stats", requireAdmin, async (req: Request, res: Response) => {
    try {
        const [totalUsers, activeUsers, totalMonitors, activeMonitors, totalChecks, totalIncidents] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { is_active: true } }),
            prisma.monitor.count(),
            prisma.monitor.count({ where: { is_active: true } }),
            prisma.monitorCheck.count(),
            prisma.incident.count(),
        ]);

        const recentUsers = await prisma.user.findMany({
            take: 5,
            orderBy: { created_at: "desc" },
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                created_at: true,
            },
        });

        const recentMonitors = await prisma.monitor.findMany({
            take: 5,
            orderBy: { created_at: "desc" },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
        });

        logger.info("Admin fetched dashboard stats", {
            adminId: req.user?.id,
        });

        res.status(200).json(
            successResponse({
                stats: {
                    totalUsers,
                    activeUsers,
                    totalMonitors,
                    activeMonitors,
                    totalChecks,
                    totalIncidents,
                },
                recentUsers,
                recentMonitors,
            })
        );
    } catch (error) {
        logger.error("Admin get stats error", {
            error: error instanceof Error ? error.message : "Unknown error",
            adminId: req.user?.id,
        });
        res.status(500).json(errorResponse("Failed to fetch stats", "FETCH_STATS_ERROR"));
    }
});

export default router;
