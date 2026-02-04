"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Globe,
    Search,
    Trash2,
    ExternalLink,
    User,
    Activity,
} from "lucide-react";
import {
    useGetAdminMonitorsQuery,
    useDeleteAdminMonitorMutation,
} from "@/store/api/adminApi";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AdminMonitorsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [userId, setUserId] = useState<string>("");
    const [status, setStatus] = useState<string>("");
    const [deleteMonitorId, setDeleteMonitorId] = useState<number | null>(null);

    const { data, isLoading, refetch } = useGetAdminMonitorsQuery({
        page,
        limit: 20,
        search: search || undefined,
        user_id: userId ? parseInt(userId) : undefined,
        status: status || undefined,
    });

    const [deleteMonitor] = useDeleteAdminMonitorMutation();

    const handleDelete = async () => {
        if (!deleteMonitorId) return;

        try {
            await deleteMonitor(deleteMonitorId).unwrap();
            toast.success("Monitor deleted successfully");
            setDeleteMonitorId(null);
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.error || "Failed to delete monitor");
        }
    };

    const monitors = data?.data?.monitors || [];
    const pagination = data?.data?.pagination;

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="secondary">Unknown</Badge>;
        if (status === "UP") return <Badge className="bg-green-100 text-green-800">UP</Badge>;
        if (status === "DOWN") return <Badge className="bg-red-100 text-red-800">DOWN</Badge>;
        return <Badge variant="secondary">{status}</Badge>;
    };

    return (
        <SidebarInset>
            <div className="flex flex-col">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <h1 className="text-lg font-semibold">Monitors Management</h1>
                </header>

                <div className="flex-1 p-4">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Filters */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search monitors by URL..."
                                            value={search}
                                            onChange={(e) => {
                                                setSearch(e.target.value);
                                                setPage(1);
                                            }}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Select value={status || "all"} onValueChange={(value) => setStatus(value === "all" ? "" : value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="UP">UP</SelectItem>
                                            <SelectItem value="DOWN">DOWN</SelectItem>
                                            <SelectItem value="TIMEOUT">TIMEOUT</SelectItem>
                                            <SelectItem value="ERROR">ERROR</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearch("");
                                            setUserId("");
                                            setStatus("");
                                            setPage(1);
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Monitors Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Monitors ({pagination?.total || 0})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                        <p className="text-gray-600 mt-2">Loading monitors...</p>
                                    </div>
                                ) : monitors.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No monitors found</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left p-3 font-medium">URL</th>
                                                        <th className="text-left p-3 font-medium">User</th>
                                                        <th className="text-left p-3 font-medium">Status</th>
                                                        <th className="text-left p-3 font-medium">Interval</th>
                                                        <th className="text-left p-3 font-medium">Checks</th>
                                                        <th className="text-left p-3 font-medium">Created</th>
                                                        <th className="text-right p-3 font-medium">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {monitors.map((monitor) => (
                                                        <tr
                                                            key={monitor.id}
                                                            className="border-b hover:bg-gray-50"
                                                        >
                                                            <td className="p-3">
                                                                <div className="flex items-center gap-2">
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
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-4 w-4 text-gray-400" />
                                                                    <div>
                                                                        <p className="text-sm">
                                                                            {monitor.user.first_name}{" "}
                                                                            {monitor.user.last_name}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {monitor.user.email}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="space-y-1">
                                                                    {getStatusBadge(monitor.last_status)}
                                                                    <div>
                                                                        <Badge
                                                                            variant={
                                                                                monitor.is_active
                                                                                    ? "default"
                                                                                    : "secondary"
                                                                            }
                                                                        >
                                                                            {monitor.is_active
                                                                                ? "Active"
                                                                                : "Inactive"}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <span className="text-gray-600">
                                                                    {monitor.interval} min
                                                                </span>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Activity className="h-4 w-4 text-gray-400" />
                                                                    <span className="text-gray-600">
                                                                        {monitor._count?.checks || 0}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <span className="text-sm text-gray-500">
                                                                    {new Date(
                                                                        monitor.created_at
                                                                    ).toLocaleDateString()}
                                                                </span>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Link
                                                                        href={`/dashboard/admin/monitors/${monitor.id}`}
                                                                    >
                                                                        <Button variant="ghost" size="sm">
                                                                            View
                                                                        </Button>
                                                                    </Link>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            setDeleteMonitorId(monitor.id)
                                                                        }
                                                                        className="text-red-600 hover:text-red-700"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {pagination && pagination.totalPages > 1 && (
                                            <div className="flex items-center justify-between mt-4">
                                                <p className="text-sm text-gray-500">
                                                    Page {pagination.page} of{" "}
                                                    {pagination.totalPages}
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setPage(page - 1)}
                                                        disabled={page === 1}
                                                    >
                                                        Previous
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setPage(page + 1)}
                                                        disabled={page >= pagination.totalPages}
                                                    >
                                                        Next
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteMonitorId !== null}
                onOpenChange={(open) => !open && setDeleteMonitorId(null)}
            >
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
