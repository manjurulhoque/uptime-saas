"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
    Users,
    Globe,
    Activity,
    CheckCircle,
    AlertCircle,
    TrendingUp,
} from "lucide-react";
import { useGetAdminStatsQuery } from "@/store/api/adminApi";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
    const { data, isLoading, error } = useGetAdminStatsQuery();

    if (isLoading) {
        return (
            <SidebarInset>
                <div className="flex flex-col">
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                    </header>
                    <div className="flex-1 p-4">
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="text-gray-600 mt-2">Loading dashboard...</p>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        );
    }

    if (error) {
        return (
            <SidebarInset>
                <div className="flex flex-col">
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                    </header>
                    <div className="flex-1 p-4">
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-gray-600">Failed to load dashboard data</p>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        );
    }

    const stats = data?.data?.stats;
    const recentUsers = data?.data?.recentUsers || [];
    const recentMonitors = data?.data?.recentMonitors || [];

    return (
        <SidebarInset>
            <div className="flex flex-col">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                </header>

                <div className="flex-1 p-4">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Users
                                    </CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats?.activeUsers || 0} active
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Monitors
                                    </CardTitle>
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats?.totalMonitors || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats?.activeMonitors || 0} active
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Checks
                                    </CardTitle>
                                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats?.totalChecks || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        All time checks
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Incidents
                                    </CardTitle>
                                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats?.totalIncidents || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        All time incidents
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Active Users
                                    </CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats?.totalUsers
                                            ? Math.round(
                                                  (stats.activeUsers / stats.totalUsers) * 100
                                              )
                                            : 0}
                                        % of total
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Active Monitors
                                    </CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats?.activeMonitors || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats?.totalMonitors
                                            ? Math.round(
                                                  (stats.activeMonitors / stats.totalMonitors) * 100
                                              )
                                            : 0}
                                        % of total
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Users */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Recent Users</CardTitle>
                                        <Link href="/dashboard/admin/users">
                                            <Button variant="outline" size="sm">
                                                View All
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {recentUsers.length > 0 ? (
                                        <div className="space-y-4">
                                            {recentUsers.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div>
                                                        <p className="font-medium">
                                                            {user.first_name} {user.last_name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(
                                                                user.created_at
                                                            ).toLocaleDateString()}
                                                        </p>
                                                        {user.is_admin && (
                                                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                                                Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500 py-4">
                                            No users yet
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Monitors */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Recent Monitors</CardTitle>
                                        <Link href="/dashboard/admin/monitors">
                                            <Button variant="outline" size="sm">
                                                View All
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {recentMonitors.length > 0 ? (
                                        <div className="space-y-4">
                                            {recentMonitors.map((monitor) => (
                                                <div
                                                    key={monitor.id}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">
                                                            {monitor.url}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {monitor.user.email}
                                                        </p>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(
                                                                monitor.created_at
                                                            ).toLocaleDateString()}
                                                        </p>
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded ${
                                                                monitor.is_active
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                            }`}
                                                        >
                                                            {monitor.is_active ? "Active" : "Inactive"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500 py-4">
                                            No monitors yet
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarInset>
    );
}
