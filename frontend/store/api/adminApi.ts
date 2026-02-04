import { api } from "@/lib/api";

export interface AdminUser {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    is_active: boolean;
    is_admin: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
    _count?: {
        monitors: number;
    };
}

export interface AdminMonitor {
    id: number;
    url: string;
    interval: number;
    last_status: string | null;
    last_checked_at: string | null;
    is_active: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
    alert_enabled: boolean;
    alert_email: string | null;
    alert_on_down: boolean;
    alert_on_up: boolean;
    alert_on_slow: boolean;
    slow_threshold: number | null;
    user: {
        id: number;
        email: string;
        first_name: string | null;
        last_name: string | null;
    };
    _count?: {
        checks: number;
        incidents: number;
    };
}

export interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    totalMonitors: number;
    activeMonitors: number;
    totalChecks: number;
    totalIncidents: number;
}

export interface CreateUserRequest {
    first_name?: string;
    last_name?: string;
    email: string;
    password: string;
    is_active?: boolean;
    is_admin?: boolean;
}

export interface UpdateUserRequest {
    first_name?: string;
    last_name?: string;
    email?: string;
    is_active?: boolean;
    is_admin?: boolean;
}

export interface AdminUsersResponse {
    users: AdminUser[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface AdminMonitorsResponse {
    monitors: AdminMonitor[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const adminApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Users
        getAdminUsers: builder.query<
            AdminUsersResponse,
            { page?: number; limit?: number; search?: string }
        >({
            query: (params) => ({
                url: "admin/users",
                params,
            }),
            providesTags: ["Admin"],
        }),

        getAdminUser: builder.query<{ user: AdminUser }, number>({
            query: (id) => `admin/users/${id}`,
            providesTags: (result, error, id) => [{ type: "Admin", id }],
        }),

        createAdminUser: builder.mutation<{ user: AdminUser }, CreateUserRequest>({
            query: (body) => ({
                url: "admin/users",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Admin"],
        }),

        updateAdminUser: builder.mutation<
            { user: AdminUser },
            { id: number; data: UpdateUserRequest }
        >({
            query: ({ id, data }) => ({
                url: `admin/users/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Admin", id },
                "Admin",
            ],
        }),

        deleteAdminUser: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `admin/users/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Admin"],
        }),

        // Monitors
        getAdminMonitors: builder.query<
            AdminMonitorsResponse,
            {
                page?: number;
                limit?: number;
                search?: string;
                user_id?: number;
                status?: string;
            }
        >({
            query: (params) => ({
                url: "admin/monitors",
                params,
            }),
            providesTags: ["Admin"],
        }),

        getAdminMonitor: builder.query<{ monitor: AdminMonitor }, number>({
            query: (id) => `admin/monitors/${id}`,
            providesTags: (result, error, id) => [{ type: "Admin", id }],
        }),

        deleteAdminMonitor: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `admin/monitors/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Admin"],
        }),

        // Stats
        getAdminStats: builder.query<
            {
                stats: AdminStats;
                recentUsers: AdminUser[];
                recentMonitors: AdminMonitor[];
            },
            void
        >({
            query: () => "admin/stats",
            providesTags: ["Admin"],
        }),
    }),
});

export const {
    useGetAdminUsersQuery,
    useGetAdminUserQuery,
    useCreateAdminUserMutation,
    useUpdateAdminUserMutation,
    useDeleteAdminUserMutation,
    useGetAdminMonitorsQuery,
    useGetAdminMonitorQuery,
    useDeleteAdminMonitorMutation,
    useGetAdminStatsQuery,
} = adminApi;
