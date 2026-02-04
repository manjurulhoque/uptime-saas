"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Users,
    Search,
    Plus,
    Edit,
    Trash2,
    Shield,
    ShieldOff,
    UserCheck,
    UserX,
} from "lucide-react";
import {
    useGetAdminUsersQuery,
    useDeleteAdminUserMutation,
    useUpdateAdminUserMutation,
} from "@/store/api/adminApi";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [editingUser, setEditingUser] = useState<any>(null);
    const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
    const router = useRouter();

    const { data, isLoading, refetch } = useGetAdminUsersQuery({
        page,
        limit: 20,
        search: search || undefined,
    });

    const [deleteUser] = useDeleteAdminUserMutation();
    const [updateUser] = useUpdateAdminUserMutation();

    const handleDelete = async () => {
        if (!deleteUserId) return;

        try {
            await deleteUser(deleteUserId).unwrap();
            toast.success("User deleted successfully");
            setDeleteUserId(null);
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.error || "Failed to delete user");
        }
    };

    const handleToggleStatus = async (user: any) => {
        try {
            await updateUser({
                id: user.id,
                data: { is_active: !user.is_active },
            }).unwrap();
            toast.success(
                `User ${user.is_active ? "deactivated" : "activated"} successfully`
            );
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.error || "Failed to update user");
        }
    };

    const handleToggleAdmin = async (user: any) => {
        try {
            await updateUser({
                id: user.id,
                data: { is_admin: !user.is_admin },
            }).unwrap();
            toast.success(
                `User ${user.is_admin ? "removed from" : "granted"} admin role`
            );
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.error || "Failed to update user");
        }
    };

    const users = data?.data?.users || [];
    const pagination = data?.data?.pagination;

    return (
        <SidebarInset>
            <div className="flex flex-col">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex items-center justify-between w-full">
                        <h1 className="text-lg font-semibold">Users Management</h1>
                        <Link href="/dashboard/admin/users/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add User
                            </Button>
                        </Link>
                    </div>
                </header>

                <div className="flex-1 p-4">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Search */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search users by name or email..."
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setPage(1);
                                        }}
                                        className="pl-10"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Users Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Users ({pagination?.total || 0})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                        <p className="text-gray-600 mt-2">Loading users...</p>
                                    </div>
                                ) : users.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No users found</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left p-3 font-medium">User</th>
                                                        <th className="text-left p-3 font-medium">Status</th>
                                                        <th className="text-left p-3 font-medium">Role</th>
                                                        <th className="text-left p-3 font-medium">Monitors</th>
                                                        <th className="text-left p-3 font-medium">Created</th>
                                                        <th className="text-right p-3 font-medium">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {users.map((user) => (
                                                        <tr key={user.id} className="border-b hover:bg-gray-50">
                                                            <td className="p-3">
                                                                <div>
                                                                    <p className="font-medium">
                                                                        {user.first_name} {user.last_name}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500">
                                                                        {user.email}
                                                                    </p>
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <Badge
                                                                    variant={
                                                                        user.is_active
                                                                            ? "default"
                                                                            : "secondary"
                                                                    }
                                                                >
                                                                    {user.is_active ? "Active" : "Inactive"}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-3">
                                                                {user.is_admin ? (
                                                                    <Badge variant="outline" className="bg-purple-50">
                                                                        Admin
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-gray-500">User</span>
                                                                )}
                                                            </td>
                                                            <td className="p-3">
                                                                <span className="text-gray-600">
                                                                    {user._count?.monitors || 0}
                                                                </span>
                                                            </td>
                                                            <td className="p-3">
                                                                <span className="text-sm text-gray-500">
                                                                    {new Date(user.created_at).toLocaleDateString()}
                                                                </span>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleToggleStatus(user)
                                                                        }
                                                                        title={
                                                                            user.is_active
                                                                                ? "Deactivate"
                                                                                : "Activate"
                                                                        }
                                                                    >
                                                                        {user.is_active ? (
                                                                            <UserX className="h-4 w-4" />
                                                                        ) : (
                                                                            <UserCheck className="h-4 w-4" />
                                                                        )}
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleToggleAdmin(user)
                                                                        }
                                                                        title={
                                                                            user.is_admin
                                                                                ? "Remove Admin"
                                                                                : "Make Admin"
                                                                        }
                                                                    >
                                                                        {user.is_admin ? (
                                                                            <ShieldOff className="h-4 w-4" />
                                                                        ) : (
                                                                            <Shield className="h-4 w-4" />
                                                                        )}
                                                                    </Button>
                                                                    <Link
                                                                        href={`/dashboard/admin/users/${user.id}`}
                                                                    >
                                                                        <Button variant="ghost" size="sm">
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => setDeleteUserId(user.id)}
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
                                                    Page {pagination.page} of {pagination.totalPages}
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
                open={deleteUserId !== null}
                onOpenChange={(open) => !open && setDeleteUserId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone
                            and will delete all associated monitors.
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
