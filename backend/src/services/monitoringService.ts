import axios, { AxiosResponse, AxiosError } from "axios";
import * as cron from "node-cron";
import prisma from "../db";
import logger from "../config/logger";

interface CheckResult {
    status: "UP" | "DOWN" | "TIMEOUT" | "ERROR";
    statusCode?: number;
    responseTime?: number;
    errorMessage?: string;
}

interface MonitorJob {
    monitorId: number;
    url: string;
    interval: number;
    cronExpression: string;
    task: cron.ScheduledTask;
}

class MonitoringService {
    private jobs: Map<number, MonitorJob> = new Map();
    private readonly timeout = 30000; // 30 seconds timeout
    private readonly userAgent = "UptimeSaaS-Monitor/1.0";

    constructor() {
        this.initializeMonitoring();
    }

    private async initializeMonitoring(): Promise<void> {
        try {
            logger.info("Initializing monitoring service...");

            // Load all active monitors and start their jobs
            const activeMonitors = await prisma.monitor.findMany({
                where: { is_active: true },
            });

            for (const monitor of activeMonitors) {
                await this.startMonitoring(monitor.id);
            }

            logger.info(
                `Monitoring service initialized with ${activeMonitors.length} monitors`,
            );
        } catch (error) {
            logger.error("Failed to initialize monitoring service", {
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    private generateCronExpression(intervalMinutes: number): string {
        // Convert minutes to cron expression
        // For intervals less than 60 minutes, run every X minutes
        if (intervalMinutes < 60) {
            return `*/${intervalMinutes} * * * *`;
        }

        // For intervals >= 60 minutes, run every X hours
        const hours = Math.floor(intervalMinutes / 60);
        return `0 */${hours} * * *`;
    }

    async startMonitoring(monitorId: number): Promise<void> {
        try {
            const monitor = await prisma.monitor.findUnique({
                where: { id: monitorId },
            });

            if (!monitor || !monitor.is_active) {
                logger.warn(`Monitor ${monitorId} not found or inactive`);
                return;
            }

            // Stop existing job if it exists
            await this.stopMonitoring(monitorId);

            const cronExpression = this.generateCronExpression(
                monitor.interval,
            );

            const task = cron.schedule(
                cronExpression,
                async () => {
                    await this.performCheck(monitorId);
                },
                {
                    // scheduled: false,
                    timezone: "UTC",
                },
            );

            const job: MonitorJob = {
                monitorId,
                url: monitor.url,
                interval: monitor.interval,
                cronExpression,
                task,
            };

            this.jobs.set(monitorId, job);
            task.start();

            logger.info(`Started monitoring for monitor ${monitorId}`, {
                monitorId,
                url: monitor.url,
                interval: monitor.interval,
                cronExpression,
            });
        } catch (error) {
            logger.error(
                `Failed to start monitoring for monitor ${monitorId}`,
                {
                    monitorId,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                },
            );
        }
    }

    async stopMonitoring(monitorId: number): Promise<void> {
        const job = this.jobs.get(monitorId);
        if (job) {
            job.task.stop();
            job.task.destroy();
            this.jobs.delete(monitorId);

            logger.info(`Stopped monitoring for monitor ${monitorId}`, {
                monitorId,
            });
        }
    }

    async updateMonitoring(monitorId: number): Promise<void> {
        await this.stopMonitoring(monitorId);
        await this.startMonitoring(monitorId);
    }

    private async performCheck(monitorId: number): Promise<void> {
        try {
            const monitor = await prisma.monitor.findUnique({
                where: { id: monitorId },
            });

            if (!monitor || !monitor.is_active) {
                logger.warn(
                    `Monitor ${monitorId} not found or inactive during check`,
                );
                return;
            }

            const startTime = Date.now();
            const result = await this.checkUrl(monitor.url);
            const responseTime = Date.now() - startTime;

            // Store the check result
            await this.storeCheckResult(monitorId, {
                ...result,
                responseTime: result.responseTime || responseTime,
            });

            // Update monitor status
            await this.updateMonitorStatus(monitorId, result);

            // Handle incidents
            await this.handleIncidents(monitorId, result);

            logger.debug(`Check completed for monitor ${monitorId}`, {
                monitorId,
                url: monitor.url,
                status: result.status,
                responseTime: result.responseTime || responseTime,
            });
        } catch (error) {
            logger.error(`Error performing check for monitor ${monitorId}`, {
                monitorId,
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    private async checkUrl(url: string): Promise<CheckResult> {
        try {
            const startTime = Date.now();

            const response: AxiosResponse = await axios.get(url, {
                timeout: this.timeout,
                headers: {
                    "User-Agent": this.userAgent,
                },
                validateStatus: (status) => status < 500, // Accept all status codes < 500
            });

            const responseTime = Date.now() - startTime;

            // Consider status codes >= 400 as DOWN
            if (response.status >= 400) {
                return {
                    status: "DOWN",
                    statusCode: response.status,
                    responseTime,
                    errorMessage: `HTTP ${response.status}`,
                };
            }

            return {
                status: "UP",
                statusCode: response.status,
                responseTime,
            };
        } catch (error) {
            const responseTime = Date.now() - Date.now();

            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;

                if (
                    axiosError.code === "ECONNABORTED" ||
                    axiosError.code === "ETIMEDOUT"
                ) {
                    return {
                        status: "TIMEOUT",
                        responseTime,
                        errorMessage: "Request timeout",
                    };
                }

                if (axiosError.response) {
                    return {
                        status: "DOWN",
                        statusCode: axiosError.response.status,
                        responseTime,
                        errorMessage: `HTTP ${axiosError.response.status}`,
                    };
                }

                return {
                    status: "ERROR",
                    responseTime,
                    errorMessage: axiosError.message,
                };
            }

            return {
                status: "ERROR",
                responseTime,
                errorMessage:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    private async storeCheckResult(
        monitorId: number,
        result: CheckResult,
    ): Promise<void> {
        try {
            await prisma.monitorCheck.create({
                data: {
                    monitor_id: monitorId,
                    status: result.status,
                    statusCode: result.statusCode,
                    responseTime: result.responseTime,
                    errorMessage: result.errorMessage,
                },
            });
        } catch (error) {
            logger.error(
                `Failed to store check result for monitor ${monitorId}`,
                {
                    monitorId,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                },
            );
        }
    }

    private async updateMonitorStatus(
        monitorId: number,
        result: CheckResult,
    ): Promise<void> {
        try {
            await prisma.monitor.update({
                where: { id: monitorId },
                data: {
                    last_status: result.status,
                    last_checked_at: new Date(),
                },
            });
        } catch (error) {
            logger.error(
                `Failed to update monitor status for monitor ${monitorId}`,
                {
                    monitorId,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                },
            );
        }
    }

    private async handleIncidents(
        monitorId: number,
        result: CheckResult,
    ): Promise<void> {
        try {
            const monitor = await prisma.monitor.findUnique({
                where: { id: monitorId },
                include: {
                    incidents: {
                        where: { ended_at: null }, // Only active incidents
                        orderBy: { started_at: "desc" },
                        take: 1,
                    },
                },
            });

            if (!monitor) return;

            const isDown =
                result.status === "DOWN" ||
                result.status === "TIMEOUT" ||
                result.status === "ERROR";
            const activeIncident = monitor.incidents[0];

            if (isDown && !activeIncident) {
                // Start new incident
                await prisma.incident.create({
                    data: {
                        monitor_id: monitorId,
                        status: "DOWN",
                        description:
                            result.errorMessage ||
                            `Monitor is ${result.status.toLowerCase()}`,
                    },
                });

                logger.info(`Incident started for monitor ${monitorId}`, {
                    monitorId,
                    url: monitor.url,
                    status: result.status,
                    errorMessage: result.errorMessage,
                });
            } else if (!isDown && activeIncident) {
                // End existing incident
                const duration = Math.floor(
                    (Date.now() - activeIncident.started_at.getTime()) /
                        (1000 * 60),
                );

                await prisma.incident.update({
                    where: { id: activeIncident.id },
                    data: {
                        status: "UP",
                        ended_at: new Date(),
                        duration,
                    },
                });

                logger.info(`Incident resolved for monitor ${monitorId}`, {
                    monitorId,
                    url: monitor.url,
                    incidentId: activeIncident.id,
                    duration,
                });
            }
        } catch (error) {
            logger.error(
                `Failed to handle incidents for monitor ${monitorId}`,
                {
                    monitorId,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                },
            );
        }
    }

    async getMonitorStats(monitorId: number, days: number = 30): Promise<any> {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const checks = await prisma.monitorCheck.findMany({
                where: {
                    monitor_id: monitorId,
                    checked_at: {
                        gte: startDate,
                    },
                },
                orderBy: { checked_at: "desc" },
            });

            const incidents = await prisma.incident.findMany({
                where: {
                    monitor_id: monitorId,
                    started_at: {
                        gte: startDate,
                    },
                },
                orderBy: { started_at: "desc" },
            });

            const totalChecks = checks.length;
            const upChecks = checks.filter((c) => c.status === "UP").length;
            const uptimePercentage = totalChecks > 0 ? (upChecks / totalChecks) * 100 : 0;

            const avgResponseTime =
                checks
                    .filter((c) => c.responseTime !== null)
                    .reduce((sum, c) => sum + (c.responseTime || 0), 0) /
                    checks.filter((c) => c.responseTime !== null).length || 0;

            return {
                totalChecks,
                upChecks,
                downChecks: totalChecks - upChecks,
                uptimePercentage: Math.round(uptimePercentage * 100) / 100,
                avgResponseTime: Math.round(avgResponseTime),
                incidents: incidents.length,
                lastCheck: checks[0]?.checked_at || null,
                lastIncident: incidents[0]?.started_at || null,
            };
        } catch (error) {
            logger.error(`Failed to get stats for monitor ${monitorId}`, {
                monitorId,
                error: error instanceof Error ? error.message : "Unknown error",
            });
            throw error;
        }
    }

    async getAllActiveJobs(): Promise<MonitorJob[]> {
        return Array.from(this.jobs.values());
    }

    async shutdown(): Promise<void> {
        logger.info("Shutting down monitoring service...");

        for (const [monitorId, job] of this.jobs) {
            job.task.stop();
            job.task.destroy();
        }

        this.jobs.clear();
        logger.info("Monitoring service shutdown complete");
    }
}

export default new MonitoringService();
