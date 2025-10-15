"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Globe,
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Play,
    Pause,
    Edit,
    Trash2,
    Eye,
} from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
    useGetMonitorsQuery,
    useUpdateMonitorStatusMutation,
    useDeleteMonitorMutation,
} from "@/store/api/monitorApi";
import type { DemoMonitor } from "@/types/monitor";
import { MONITOR_STATUS } from "@/types/monitor";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

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
    {
        id: 4,
        url: "https://blog.example.com",
        interval: 10,
        last_status: "UP",
        last_checked_at: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        is_active: true,
        user_id: 1,
        created_at: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
        stats: {
            totalChecks: 4320,
            upChecks: 4315,
            downChecks: 5,
            uptimePercentage: 99.88,
            avgResponseTime: 189,
            incidents: 1,
            lastCheck: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
            lastIncident: new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
        },
    },
    {
        id: 5,
        url: "https://cdn.example.com",
        interval: 2,
        last_status: "TIMEOUT",
        last_checked_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        is_active: true,
        user_id: 1,
        created_at: new Date(
            Date.now() - 21 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
        stats: {
            totalChecks: 15120,
            upChecks: 15080,
            downChecks: 40,
            uptimePercentage: 99.74,
            avgResponseTime: 95,
            incidents: 4,
            lastCheck: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
            lastIncident: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        },
    },
];

export default function MonitorsListPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { toast } = useToast();

    const { data: monitorsData, isLoading, error } = useGetMonitorsQuery();
    const [updateMonitorStatus] = useUpdateMonitorStatusMutation();
    const [deleteMonitor] = useDeleteMonitorMutation();

    // Use demo data if API is not available or loading
    const monitors = monitorsData?.data?.monitors || demoMonitors;

    const filteredMonitors = monitors.filter((monitor) => {
        const matchesSearch = monitor.url
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && monitor.is_active) ||
            (statusFilter === "inactive" && !monitor.is_active) ||
            (statusFilter === "up" && monitor.last_status === "UP") ||
            (statusFilter === "down" && monitor.last_status === "DOWN");

        return matchesSearch && matchesStatus;
    });

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
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case "DOWN":
                return <AlertTriangle className="h-4 w-4 text-red-600" />;
            case "TIMEOUT":
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case "ERROR":
                return <AlertTriangle className="h-4 w-4 text-gray-600" />;
            default:
                return <Activity className="h-4 w-4 text-gray-400" />;
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

    const handleToggleStatus = async (
        monitorId: number,
        currentStatus: boolean
    ) => {
        try {
            await updateMonitorStatus({
                id: monitorId,
                data: { isActive: !currentStatus },
            }).unwrap();

            toast({
                title: "Monitor status updated",
                description: `Monitor ${
                    currentStatus ? "paused" : "resumed"
                } successfully`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update monitor status",
                variant: "destructive",
            });
        }
    };

    const handleDeleteMonitor = async (
        monitorId: number,
        monitorUrl: string
    ) => {
        if (
            !confirm(
                `Are you sure you want to delete the monitor for ${monitorUrl}?`
            )
        ) {
            return;
        }

        try {
            await deleteMonitor(monitorId).unwrap();

            toast({
                title: "Monitor deleted",
                description: `Monitor for ${monitorUrl} has been deleted`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete monitor",
                variant: "destructive",
            });
        }
    };

    return (
        <SidebarInset>
            <div className="flex flex-col">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-semibold">Monitors</h1>
                    </div>
                </header>

                <div className="flex-1 p-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <p className="text-gray-600">
                                Manage and monitor your websites and APIs
                            </p>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search monitors..."
                                        className="pl-10 w-64"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="up">Up</option>
                                    <option value="down">Down</option>
                                </select>
                            </div>
                            <Link href="/dashboard/monitors/new">
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Monitor
                                </Button>
                            </Link>
                        </div>

                        {/* Monitors Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {filteredMonitors.length} Monitor
                                    {filteredMonitors.length !== 1 ? "s" : ""}
                                </CardTitle>
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
                                            {searchTerm ||
                                            statusFilter !== "all"
                                                ? "Try adjusting your search or filter criteria"
                                                : "Get started by adding your first monitor"}
                                        </p>
                                        <Link href="/dashboard/monitors/new">
                                            <Button>
                                                Add Your First Monitor
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Status</TableHead>
                                                <TableHead>URL</TableHead>
                                                <TableHead>Interval</TableHead>
                                                <TableHead>
                                                    Last Checked
                                                </TableHead>
                                                <TableHead>Uptime</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredMonitors.map((monitor) => (
                                                <TableRow key={monitor.id}>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            {getStatusIcon(
                                                                monitor.last_status
                                                            )}
                                                            {getStatusBadge(
                                                                monitor.last_status
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {monitor.url}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {monitor.is_active
                                                                    ? "Active"
                                                                    : "Paused"}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-gray-600">
                                                            {monitor.interval}{" "}
                                                            min
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-gray-600">
                                                            {formatLastChecked(
                                                                monitor.last_checked_at
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            <div className="font-medium text-gray-900">
                                                                {monitor.stats?.uptimePercentage?.toFixed(
                                                                    2
                                                                ) || "N/A"}
                                                                %
                                                            </div>
                                                            <div className="text-gray-500">
                                                                {monitor.stats
                                                                    ?.avgResponseTime ||
                                                                    "N/A"}
                                                                ms avg
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Link
                                                                href={`/dashboard/monitors/${monitor.id}`}
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleToggleStatus(
                                                                        monitor.id,
                                                                        monitor.is_active
                                                                    )
                                                                }
                                                            >
                                                                {monitor.is_active ? (
                                                                    <Pause className="h-4 w-4" />
                                                                ) : (
                                                                    <Play className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                    >
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        asChild
                                                                    >
                                                                        <Link
                                                                            href={`/dashboard/monitors/${monitor.id}/edit`}
                                                                        >
                                                                            <Edit className="h-4 w-4 mr-2" />
                                                                            Edit
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleDeleteMonitor(
                                                                                monitor.id,
                                                                                monitor.url
                                                                            )
                                                                        }
                                                                        className="text-red-600"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </SidebarInset>
    );
}
