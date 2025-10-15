"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Search,
    Filter,
    Globe,
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
} from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useGetMonitorsQuery } from "@/store/api/monitorApi";
import type { DemoMonitor } from "@/types/monitor";
import { MONITOR_STATUS } from "@/types/monitor";
import Link from "next/link";

// Demo data for development
const demoMonitors: DemoMonitor[] = [
    {
        id: 1,
        url: "https://example.com",
        interval: 5,
        last_status: "UP",
        last_checked_at: new Date().toISOString(),
        is_active: true,
        user_id: 1,
        created_at: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
        stats: {
            totalChecks: 2016,
            upChecks: 2010,
            downChecks: 6,
            uptimePercentage: 99.7,
            avgResponseTime: 245,
            incidents: 2,
            lastCheck: new Date().toISOString(),
            lastIncident: new Date(
                Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
        },
    },
    {
        id: 2,
        url: "https://api.example.com",
        interval: 1,
        last_status: "DOWN",
        last_checked_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        is_active: true,
        user_id: 1,
        created_at: new Date(
            Date.now() - 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
        stats: {
            totalChecks: 20160,
            upChecks: 20120,
            downChecks: 40,
            uptimePercentage: 99.8,
            avgResponseTime: 156,
            incidents: 3,
            lastCheck: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            lastIncident: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        },
    },
    {
        id: 3,
        url: "https://staging.example.com",
        interval: 15,
        last_status: "UP",
        last_checked_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        is_active: false,
        user_id: 1,
        created_at: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
        stats: {
            totalChecks: 288,
            upChecks: 285,
            downChecks: 3,
            uptimePercentage: 98.96,
            avgResponseTime: 320,
            incidents: 1,
            lastCheck: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            lastIncident: new Date(
                Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
        },
    },
];

export default function DashboardPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: monitorsData, isLoading, error } = useGetMonitorsQuery();

    // Use demo data if API is not available or loading
    const monitors = monitorsData?.data?.monitors || demoMonitors;

    const filteredMonitors = monitors.filter((monitor) =>
        monitor.url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalMonitors = monitors.length;
    const activeMonitors = monitors.filter((m) => m.is_active).length;
    const upMonitors = monitors.filter((m) => m.last_status === "UP").length;
    const downMonitors = monitors.filter(
        (m) => m.last_status === "DOWN"
    ).length;

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
                return <CheckCircle className="h-4 w-4 text-ship-cove-600" />;
            case "DOWN":
                return <AlertTriangle className="h-4 w-4 text-red-600" />;
            case "TIMEOUT":
                return <Clock className="h-4 w-4 text-ship-cove-500" />;
            case "ERROR":
                return <AlertTriangle className="h-4 w-4 text-ship-cove-700" />;
            default:
                return <Activity className="h-4 w-4 text-gray-400" />;
        }
    };

    return (
        <SidebarInset>
            <div className="flex flex-col">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-semibold">
                            Dashboard Overview
                        </h1>
                    </div>
                </header>

                <div className="flex-1 p-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <p className="text-gray-600">
                                Monitor your websites and APIs for uptime and
                                performance
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Monitors
                                    </CardTitle>
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {totalMonitors}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {activeMonitors} active
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Uptime
                                    </CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {upMonitors}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {downMonitors} down
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Active Monitors
                                    </CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {activeMonitors}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {totalMonitors - activeMonitors} paused
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
                                        245ms
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Last 24 hours
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-4">
                                    <Link href="/dashboard/monitors/new">
                                        <Button className="flex items-center gap-2">
                                            <Plus className="h-4 w-4" />
                                            Add New Monitor
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/monitors">
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2"
                                        >
                                            <Globe className="h-4 w-4" />
                                            View All Monitors
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Monitors */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Monitors</CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search monitors..."
                                                className="pl-10 w-64"
                                                value={searchTerm}
                                                onChange={(e) =>
                                                    setSearchTerm(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Filter className="h-4 w-4 mr-2" />
                                            Filter
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                        <p className="text-gray-600 mt-2">
                                            Loading monitors...
                                        </p>
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-8">
                                        <p className="text-red-600">
                                            Error loading monitors
                                        </p>
                                        <p className="text-gray-600 text-sm mt-1">
                                            Using demo data
                                        </p>
                                    </div>
                                ) : filteredMonitors.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            No monitors found
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            {searchTerm
                                                ? "Try adjusting your search terms"
                                                : "Get started by adding your first monitor"}
                                        </p>
                                        <Link href="/dashboard/monitors/new">
                                            <Button>
                                                Add Your First Monitor
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredMonitors
                                            .slice(0, 5)
                                            .map((monitor) => (
                                                <div
                                                    key={monitor.id}
                                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        {getStatusIcon(
                                                            monitor.last_status
                                                        )}
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">
                                                                {monitor.url}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                Checked every{" "}
                                                                {
                                                                    monitor.interval
                                                                }{" "}
                                                                minutes
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
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
                                                        <Link
                                                            href={`/dashboard/monitors/${monitor.id}`}
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                View Details
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        {filteredMonitors.length > 5 && (
                                            <div className="text-center pt-4">
                                                <Link href="/dashboard/monitors">
                                                    <Button variant="outline">
                                                        View All{" "}
                                                        {
                                                            filteredMonitors.length
                                                        }{" "}
                                                        Monitors
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </SidebarInset>
    );
}
