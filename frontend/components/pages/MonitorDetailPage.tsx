"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Globe,
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    BarChart3,
    AlertCircle,
} from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
    useGetMonitorQuery,
    useGetMonitorStatsQuery,
} from "@/store/api/monitorApi";
import { MONITOR_STATUS } from "@/types/monitor";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function MonitorDetailPage() {
    const params = useParams();
    const monitorId = parseInt(params.id as string);

    const {
        data: monitorData,
        isLoading: monitorLoading,
        error: monitorError,
    } = useGetMonitorQuery(monitorId);
    const { data: statsData, isLoading: statsLoading } =
        useGetMonitorStatsQuery({ id: monitorId });

    const monitor = monitorData?.data?.monitor;
    const stats = statsData?.data?.stats;

    const getStatusBadge = (status: string | null) => {
        if (!status) return null;

        const statusConfig =
            MONITOR_STATUS[status as keyof typeof MONITOR_STATUS];
        if (!statusConfig) return null;

        return (
            <Badge
                className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0`}
            >
                {statusConfig.label}
            </Badge>
        );
    };

    const getStatusIcon = (status: string | null) => {
        switch (status) {
            case "UP":
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case "DOWN":
                return <AlertTriangle className="h-5 w-5 text-red-600" />;
            case "TIMEOUT":
                return <Clock className="h-5 w-5 text-yellow-600" />;
            case "ERROR":
                return <AlertTriangle className="h-5 w-5 text-gray-600" />;
            default:
                return <Activity className="h-5 w-5 text-gray-400" />;
        }
    };

    const formatLastChecked = (lastChecked: string | null) => {
        if (!lastChecked) return "Never";

        const now = new Date();
        const checked = new Date(lastChecked);
        const diffMs = now.getTime() - checked.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    if (monitorLoading) {
        return (
            <SidebarInset>
                <div className="flex flex-col">
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-semibold">
                                Loading...
                            </h1>
                        </div>
                    </header>
                    <div className="flex-1 p-4">
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="text-gray-600 mt-2">
                                Loading monitor details...
                            </p>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        );
    }

    if (monitorError || !monitor) {
        return (
            <SidebarInset>
                <div className="flex flex-col">
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="flex items-center gap-2">
                            <Link href="/dashboard/monitors">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Monitors
                                </Button>
                            </Link>
                            <h1 className="text-lg font-semibold">
                                Monitor Not Found
                            </h1>
                        </div>
                    </header>
                    <div className="flex-1 p-4">
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Monitor not found
                            </h3>
                            <p className="text-gray-600 mb-4">
                                The monitor you're looking for doesn't exist or
                                you don't have permission to view it.
                            </p>
                            <Link href="/dashboard/monitors">
                                <Button>Back to Monitors</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        );
    }

    return (
        <SidebarInset>
            <div className="flex flex-col">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard/monitors">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Monitors
                            </Button>
                        </Link>
                        <h1 className="text-lg font-semibold">
                            Monitor Details
                        </h1>
                    </div>
                </header>

                <div className="flex-1 p-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8">
                            <p className="text-gray-600">
                                Detailed information about your monitor
                            </p>
                        </div>

                        {/* Monitor Overview */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {getStatusIcon(monitor.last_status)}
                                        Monitor Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {monitor.url}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Checked every {monitor.interval}{" "}
                                                minutes
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(
                                                monitor.last_status
                                            )}
                                            <Badge
                                                variant={
                                                    monitor.is_active
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {monitor.is_active
                                                    ? "Active"
                                                    : "Paused"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Last Checked
                                            </p>
                                            <p className="font-medium">
                                                {formatLastChecked(
                                                    monitor.last_checked_at
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Created
                                            </p>
                                            <p className="font-medium">
                                                {new Date(
                                                    monitor.created_at
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Quick Stats
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {statsLoading ? (
                                        <div className="text-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                                        </div>
                                    ) : stats ? (
                                        <div className="space-y-4">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-green-600">
                                                    {stats.uptimePercentage.toFixed(
                                                        2
                                                    )}
                                                    %
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Uptime (30 days)
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                <div>
                                                    <div className="text-lg font-semibold">
                                                        {stats.totalChecks}
                                                    </div>
                                                    <p className="text-xs text-gray-600">
                                                        Total Checks
                                                    </p>
                                                </div>
                                                <div>
                                                    <div className="text-lg font-semibold">
                                                        {stats.avgResponseTime}
                                                        ms
                                                    </div>
                                                    <p className="text-xs text-gray-600">
                                                        Avg Response
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-semibold text-red-600">
                                                    {stats.incidents}
                                                </div>
                                                <p className="text-xs text-gray-600">
                                                    Incidents
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-gray-600 text-sm">
                                                No stats available
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Detailed Stats */}
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Total Checks
                                        </CardTitle>
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {stats.totalChecks}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Last 30 days
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Successful Checks
                                        </CardTitle>
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">
                                            {stats.upChecks}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {stats.downChecks} failed
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Avg Response Time
                                        </CardTitle>
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {stats.avgResponseTime}ms
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Last 30 days
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Incidents
                                        </CardTitle>
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-red-600">
                                            {stats.incidents}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Last 30 days
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-4">
                                    <Link
                                        href={`/dashboard/monitors/${monitor.id}/edit`}
                                    >
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2"
                                        >
                                            <Globe className="h-4 w-4" />
                                            Edit Monitor
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <TrendingUp className="h-4 w-4" />
                                        View Reports
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <BarChart3 className="h-4 w-4" />
                                        View Checks
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </SidebarInset>
    );
}
