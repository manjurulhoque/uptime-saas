"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
    Trash2,
    User,
    ExternalLink,
    Mail,
    Bell,
} from "lucide-react";
import {
    useGetAdminMonitorQuery,
    useGetAdminMonitorStatsQuery,
    useDeleteAdminMonitorMutation,
} from "@/store/api/adminApi";
import { toast } from "sonner";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminMonitorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const monitorId = parseInt(params.id as string);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const {
        data: monitorData,
        isLoading: monitorLoading,
        error: monitorError,
    } = useGetAdminMonitorQuery(monitorId);

    const {
        data: statsData,
        isLoading: statsLoading,
    } = useGetAdminMonitorStatsQuery(monitorId);

    const [deleteMonitor] = useDeleteAdminMonitorMutation();

    const monitor = monitorData?.data?.monitor;
    const stats = statsData?.data?.stats;

    const handleDelete = async () => {
        try {
            await deleteMonitor(monitorId).unwrap();
            toast.success("Monitor deleted successfully");
            router.push("/dashboard/admin/monitors");
        } catch (error: any) {
            toast.error(error?.data?.error || "Failed to delete monitor");
        }
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="secondary">Unknown</Badge>;
        if (status === "UP")
            return <Badge className="bg-green-100 text-green-800">UP</Badge>;
        if (status === "DOWN")
            return <Badge className="bg-red-100 text-red-800">DOWN</Badge>;
        if (status === "TIMEOUT")
            return <Badge className="bg-yellow-100 text-yellow-800">TIMEOUT</Badge>;
        if (status === "ERROR")
            return <Badge className="bg-gray-100 text-gray-800">ERROR</Badge>;
        return <Badge variant="secondary">{status}</Badge>;
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
                return <AlertCircle className="h-5 w-5 text-gray-600" />;
            default:
                return <Activity className="h-5 w-5 text-gray-400" />;
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return "Never";
        return new Date(date).toLocaleString();
    };

    const formatRelativeTime = (date: string | null) => {
        if (!date) return "Never";
        const now = new Date();
        const then = new Date(date);
        const diffMs = now.getTime() - then.getTime();
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
                        <h1 className="text-lg font-semibold">Loading...</h1>
                    </header>
                    <div className="flex-1 p-4">
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="text-gray-600 mt-2">Loading monitor details...</p>
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
                        <Link href="/dashboard/admin/monitors">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Monitors
                            </Button>
                        </Link>
                        <h1 className="text-lg font-semibold">Monitor Not Found</h1>
                    </header>
                    <div className="flex-1 p-4">
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Monitor not found
                            </h3>
                            <p className="text-gray-600 mb-4">
                                The monitor you're looking for doesn't exist or has been deleted.
                            </p>
                            <Link href="/dashboard/admin/monitors">
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
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <Link href="/dashboard/admin/monitors">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Monitors
                                </Button>
                            </Link>
                            <h1 className="text-lg font-semibold">Monitor Details</h1>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Monitor
                        </Button>
                    </div>
                </header>

                <div className="flex-1 p-4">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Monitor Overview */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Monitor Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="h-5 w-5" />
                                        Monitor Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-sm text-gray-600">URL</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <a
                                                href={monitor.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                {monitor.url}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm text-gray-600">Status</Label>
                                            <div className="mt-1 flex items-center gap-2">
                                                {getStatusIcon(monitor.last_status)}
                                                {getStatusBadge(monitor.last_status)}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-gray-600">Active</Label>
                                            <div className="mt-1">
                                                <Badge
                                                    variant={
                                                        monitor.is_active ? "default" : "secondary"
                                                    }
                                                >
                                                    {monitor.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm text-gray-600">
                                                Check Interval
                                            </Label>
                                            <p className="mt-1 font-medium">{monitor.interval} minutes</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-gray-600">
                                                Last Checked
                                            </Label>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {formatRelativeTime(monitor.last_checked_at)}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm text-gray-600">Owner</Label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="font-medium">
                                                    {monitor.user.first_name} {monitor.user.last_name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {monitor.user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm text-gray-600">Created</Label>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {formatDate(monitor.created_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-gray-600">Updated</Label>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {formatDate(monitor.updated_at)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Alert Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5" />
                                        Alert Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm text-gray-600">
                                            Email Alerts
                                        </Label>
                                        <Badge variant={monitor.alert_enabled ? "default" : "secondary"}>
                                            {monitor.alert_enabled ? "Enabled" : "Disabled"}
                                        </Badge>
                                    </div>

                                    {monitor.alert_enabled && (
                                        <>
                                            <div>
                                                <Label className="text-sm text-gray-600">
                                                    Alert Email
                                                </Label>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    <p className="text-sm">
                                                        {monitor.alert_email || monitor.user.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm text-gray-600">
                                                    Alert Conditions
                                                </Label>
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">On Down</span>
                                                        <Badge
                                                            variant={
                                                                monitor.alert_on_down
                                                                    ? "default"
                                                                    : "secondary"
                                                            }
                                                        >
                                                            {monitor.alert_on_down ? "Yes" : "No"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">On Up</span>
                                                        <Badge
                                                            variant={
                                                                monitor.alert_on_up
                                                                    ? "default"
                                                                    : "secondary"
                                                            }
                                                        >
                                                            {monitor.alert_on_up ? "Yes" : "No"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">On Slow</span>
                                                        <Badge
                                                            variant={
                                                                monitor.alert_on_slow
                                                                    ? "default"
                                                                    : "secondary"
                                                            }
                                                        >
                                                            {monitor.alert_on_slow ? "Yes" : "No"}
                                                        </Badge>
                                                    </div>
                                                    {monitor.alert_on_slow && monitor.slow_threshold && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm">
                                                                Slow Threshold
                                                            </span>
                                                            <span className="text-sm font-medium">
                                                                {monitor.slow_threshold}ms
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Statistics */}
                        {stats && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Statistics (Last 30 Days)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">{stats.totalChecks}</div>
                                            <p className="text-sm text-gray-600">Total Checks</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {stats.upChecks}
                                            </div>
                                            <p className="text-sm text-gray-600">Up Checks</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">
                                                {stats.downChecks}
                                            </div>
                                            <p className="text-sm text-gray-600">Down Checks</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">
                                                {stats.uptimePercentage.toFixed(2)}%
                                            </div>
                                            <p className="text-sm text-gray-600">Uptime</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">
                                                {stats.avgResponseTime}ms
                                            </div>
                                            <p className="text-sm text-gray-600">Avg Response</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">
                                                {stats.incidents}
                                            </div>
                                            <p className="text-sm text-gray-600">Incidents</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-medium">
                                                {formatRelativeTime(stats.lastCheck)}
                                            </div>
                                            <p className="text-sm text-gray-600">Last Check</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-medium">
                                                {formatRelativeTime(stats.lastIncident)}
                                            </div>
                                            <p className="text-sm text-gray-600">Last Incident</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Recent Checks */}
                        {monitor.checks && monitor.checks.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Recent Checks
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-2 font-medium">Time</th>
                                                    <th className="text-left p-2 font-medium">Status</th>
                                                    <th className="text-left p-2 font-medium">
                                                        Status Code
                                                    </th>
                                                    <th className="text-left p-2 font-medium">
                                                        Response Time
                                                    </th>
                                                    <th className="text-left p-2 font-medium">Error</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {monitor.checks.map((check) => (
                                                    <tr key={check.id} className="border-b">
                                                        <td className="p-2 text-sm">
                                                            {formatDate(check.checked_at)}
                                                        </td>
                                                        <td className="p-2">{getStatusBadge(check.status)}</td>
                                                        <td className="p-2 text-sm">
                                                            {check.statusCode || "-"}
                                                        </td>
                                                        <td className="p-2 text-sm">
                                                            {check.responseTime
                                                                ? `${check.responseTime}ms`
                                                                : "-"}
                                                        </td>
                                                        <td className="p-2 text-sm text-red-600">
                                                            {check.errorMessage || "-"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Recent Incidents */}
                        {monitor.incidents && monitor.incidents.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" />
                                        Recent Incidents
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {monitor.incidents.map((incident) => (
                                            <div
                                                key={incident.id}
                                                className="border rounded-lg p-4 space-y-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {incident.status === "DOWN" ? (
                                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                                        ) : (
                                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                                        )}
                                                        <Badge
                                                            variant={
                                                                incident.status === "DOWN"
                                                                    ? "destructive"
                                                                    : "default"
                                                            }
                                                        >
                                                            {incident.status}
                                                        </Badge>
                                                    </div>
                                                    {incident.duration && (
                                                        <span className="text-sm text-gray-600">
                                                            Duration: {incident.duration} minutes
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <p>
                                                        Started: {formatDate(incident.started_at)}
                                                    </p>
                                                    {incident.ended_at && (
                                                        <p>Ended: {formatDate(incident.ended_at)}</p>
                                                    )}
                                                </div>
                                                {incident.description && (
                                                    <p className="text-sm">{incident.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Monitor</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this monitor? This action cannot be
                            undone and will delete all associated checks, incidents, and
                            notifications.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </SidebarInset>
    );
}
