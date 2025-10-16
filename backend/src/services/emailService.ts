import nodemailer, { Transporter } from "nodemailer";
import logger from "../config/logger";
import prisma from "../db";

interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}

interface NotificationData {
    monitorId: number;
    monitorUrl: string;
    type: "DOWN" | "UP" | "SLOW" | "RESOLVED";
    status?: string;
    responseTime?: number;
    errorMessage?: string;
    incidentDuration?: number;
}

class EmailService {
    private transporter: Transporter | null = null;
    private readonly fromEmail: string;
    private readonly fromName: string;

    constructor() {
        this.fromEmail = process.env.SMTP_FROM_EMAIL || "noreply@uptimesaas.com";
        this.fromName = process.env.SMTP_FROM_NAME || "UptimeSaaS";
        this.initializeTransporter();
    }

    private initializeTransporter(): void {
        try {
            const smtpConfig = {
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || "587"),
                secure: process.env.SMTP_SECURE === "true",
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            };

            // If SMTP is not configured, use a test account for development
            if (!smtpConfig.host || !smtpConfig.auth.user) {
                logger.warn(
                    "SMTP not configured, using test account for development",
                );
                this.transporter = nodemailer.createTransport({
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false,
                    auth: {
                        user: "ethereal.user@ethereal.email",
                        pass: "ethereal.pass",
                    },
                });
            } else {
                this.transporter = nodemailer.createTransport(smtpConfig);
            }

            logger.info("Email service initialized successfully");
        } catch (error) {
            logger.error("Failed to initialize email service", {
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    private generateEmailTemplate(data: NotificationData): EmailTemplate {
        const {
            monitorUrl,
            type,
            status,
            responseTime,
            errorMessage,
            incidentDuration,
        } = data;

        const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const monitorUrlEncoded = encodeURIComponent(monitorUrl);

        let subject: string;
        let statusText: string;
        let statusColor: string;
        let icon: string;

        switch (type) {
            case "DOWN":
                subject = `🚨 Monitor DOWN: ${monitorUrl}`;
                statusText = "DOWN";
                statusColor = "#dc2626";
                icon = "🔴";
                break;
            case "UP":
                subject = `✅ Monitor UP: ${monitorUrl}`;
                statusText = "UP";
                statusColor = "#16a34a";
                icon = "🟢";
                break;
            case "SLOW":
                subject = `⚠️ Slow Response: ${monitorUrl}`;
                statusText = "SLOW";
                statusColor = "#ea580c";
                icon = "🟡";
                break;
            case "RESOLVED":
                subject = `✅ Incident Resolved: ${monitorUrl}`;
                statusText = "RESOLVED";
                statusColor = "#16a34a";
                icon = "✅";
                break;
            default:
                subject = `Monitor Alert: ${monitorUrl}`;
                statusText = type;
                statusColor = "#6b7280";
                icon = "📊";
        }

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .status { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; margin: 10px 0; }
        .monitor-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor}; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .icon { font-size: 24px; margin-right: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><span class="icon">${icon}</span>UptimeSaaS Alert</h1>
            <p>Monitor Status Notification</p>
        </div>
        
        <div class="content">
            <div class="monitor-info">
                <h2>Monitor Details</h2>
                <p><strong>URL:</strong> <a href="${monitorUrl}" target="_blank">${monitorUrl}</a></p>
                <p><strong>Status:</strong> <span class="status" style="background-color: ${statusColor}">${statusText}</span></p>
                ${responseTime ? `<p><strong>Response Time:</strong> ${responseTime}ms</p>` : ""}
                ${errorMessage ? `<p><strong>Error:</strong> ${errorMessage}</p>` : ""}
                ${incidentDuration ? `<p><strong>Incident Duration:</strong> ${incidentDuration} minutes</p>` : ""}
            </div>

            <div class="details">
                <h3>What happened?</h3>
                ${this.getIncidentDescription(type, responseTime, errorMessage)}
            </div>

            <div style="text-align: center;">
                <a href="${baseUrl}/dashboard/monitors" class="button">View Dashboard</a>
                <a href="${baseUrl}/dashboard/monitors?url=${monitorUrlEncoded}" class="button">View Monitor</a>
            </div>

            <div class="footer">
                <p>This is an automated message from UptimeSaaS monitoring service.</p>
                <p>To manage your alert preferences, visit your <a href="${baseUrl}/dashboard/settings">account settings</a>.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

        const text = `
UptimeSaaS Alert - ${subject}

Monitor Details:
- URL: ${monitorUrl}
- Status: ${statusText}
${responseTime ? `- Response Time: ${responseTime}ms` : ""}
${errorMessage ? `- Error: ${errorMessage}` : ""}
${incidentDuration ? `- Incident Duration: ${incidentDuration} minutes` : ""}

${this.getIncidentDescription(type, responseTime, errorMessage)}

View your dashboard: ${baseUrl}/dashboard/monitors
View this monitor: ${baseUrl}/dashboard/monitors?url=${monitorUrlEncoded}

---
This is an automated message from UptimeSaaS monitoring service.
To manage your alert preferences, visit: ${baseUrl}/dashboard/settings
        `;

        return { subject, html, text };
    }

    private getIncidentDescription(
        type: string,
        responseTime?: number,
        errorMessage?: string,
    ): string {
        switch (type) {
            case "DOWN":
                return `<p>Your monitor detected that the website is currently down and not responding to requests. ${errorMessage ? `The error was: ${errorMessage}` : "This could be due to server issues, network problems, or maintenance."}</p>`;
            case "UP":
                return `<p>Great news! Your monitor is now responding normally and the website is back online.</p>`;
            case "SLOW":
                return `<p>Your monitor detected that the website is responding slowly (${responseTime}ms). This might indicate performance issues or high server load.</p>`;
            case "RESOLVED":
                return `<p>The incident has been resolved and your monitor is now working normally again.</p>`;
            default:
                return `<p>A status change was detected for your monitor.</p>`;
        }
    }

    async sendNotification(data: NotificationData): Promise<boolean> {
        if (!this.transporter) {
            logger.error("Email transporter not initialized");
            return false;
        }

        try {
            // Get monitor and user details
            const monitor = await prisma.monitor.findUnique({
                where: { id: data.monitorId },
                include: { user: true },
            });

            if (!monitor) {
                logger.error(`Monitor ${data.monitorId} not found`);
                return false;
            }

            // Use monitor's alert email or fall back to user email
            const recipientEmail = monitor.alert_email || monitor.user.email;

            // Generate email template
            const template = this.generateEmailTemplate(data);

            // Create notification record
            const notification = await prisma.notification.create({
                data: {
                    monitor_id: data.monitorId,
                    type: data.type,
                    status: "PENDING",
                    email: recipientEmail,
                    subject: template.subject,
                    message: template.text,
                },
            });

            // Send email
            const mailOptions = {
                from: `"${this.fromName}" <${this.fromEmail}>`,
                to: recipientEmail,
                subject: template.subject,
                text: template.text,
                html: template.html,
            };

            const info = await this.transporter.sendMail(mailOptions);

            // Update notification as sent
            await prisma.notification.update({
                where: { id: notification.id },
                data: {
                    status: "SENT",
                    sent_at: new Date(),
                },
            });

            logger.info(`Email notification sent successfully`, {
                notificationId: notification.id,
                monitorId: data.monitorId,
                recipientEmail,
                type: data.type,
                messageId: info.messageId,
            });

            return true;
        } catch (error) {
            logger.error(`Failed to send email notification`, {
                monitorId: data.monitorId,
                error: error instanceof Error ? error.message : "Unknown error",
            });

            // Update notification as failed
            try {
                await prisma.notification.updateMany({
                    where: {
                        monitor_id: data.monitorId,
                        status: "PENDING",
                        type: data.type,
                    },
                    data: {
                        status: "FAILED",
                        error_message:
                            error instanceof Error
                                ? error.message
                                : "Unknown error",
                    },
                });
            } catch (updateError) {
                logger.error("Failed to update notification status", {
                    error:
                        updateError instanceof Error
                            ? updateError.message
                            : "Unknown error",
                });
            }

            return false;
        }
    }

    async testEmailConnection(): Promise<boolean> {
        if (!this.transporter) {
            return false;
        }

        try {
            await this.transporter.verify();
            logger.info("Email connection test successful");
            return true;
        } catch (error) {
            logger.error("Email connection test failed", {
                error: error instanceof Error ? error.message : "Unknown error",
            });
            return false;
        }
    }
}

export default new EmailService();
