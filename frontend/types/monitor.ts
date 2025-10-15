// Monitor/Site types based on the backend Prisma schema
export interface Monitor {
    id: number;
    url: string;
    interval: number; // minutes
    last_status: string | null; // e.g., "200", "DOWN"
    last_checked_at: string | null; // ISO date string
    is_active: boolean;
    user_id: number;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

export interface MonitorCheck {
    id: number;
    monitor_id: number;
    status: "UP" | "DOWN" | "TIMEOUT" | "ERROR";
    statusCode: number | null; // HTTP status code
    responseTime: number | null; // Response time in milliseconds
    errorMessage: string | null; // Error message if check failed
    checked_at: string; // ISO date string
}

export interface Incident {
    id: number;
    monitor_id: number;
    status: "DOWN" | "UP"; // "DOWN" when incident is active, "UP" when resolved
    started_at: string; // ISO date string
    ended_at: string | null; // ISO date string
    duration: number | null; // Duration in minutes
    description: string | null; // Incident description
}

export interface MonitorStats {
    totalChecks: number;
    upChecks: number;
    downChecks: number;
    uptimePercentage: number;
    avgResponseTime: number;
    incidents: number;
    lastCheck: string | null; // ISO date string
    lastIncident: string | null; // ISO date string
}

// Request/Response types for API calls
export interface CreateMonitorRequest {
    url: string;
    interval: number;
}

export interface UpdateMonitorRequest {
    url?: string;
    interval?: number;
}

export interface UpdateMonitorStatusRequest {
    isActive: boolean;
}

export interface MonitorResponse {
    success: boolean;
    message: string;
    data: {
        monitor: Monitor;
    };
}

export interface MonitorsResponse {
    success: boolean;
    message: string;
    data: {
        monitors: Monitor[];
    };
}

export interface MonitorChecksResponse {
    success: boolean;
    message: string;
    data: {
        checks: MonitorCheck[];
    };
}

export interface MonitorIncidentsResponse {
    success: boolean;
    message: string;
    data: {
        incidents: Incident[];
    };
}

export interface MonitorStatsResponse {
    success: boolean;
    message: string;
    data: {
        stats: MonitorStats;
    };
}

// Query parameters for API calls
export interface MonitorQueryParams {
    limit?: number;
    days?: number;
}

// Demo data types for development
export interface DemoMonitor extends Monitor {
    checks?: MonitorCheck[];
    incidents?: Incident[];
    stats?: MonitorStats;
}

// Status colors and labels
export const MONITOR_STATUS = {
    UP: {
        label: "Up",
        color: "green",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
    },
    DOWN: {
        label: "Down",
        color: "red",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
    },
    TIMEOUT: {
        label: "Timeout",
        color: "yellow",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
    },
    ERROR: {
        label: "Error",
        color: "gray",
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
    },
} as const;

export type MonitorStatusType = keyof typeof MONITOR_STATUS;
