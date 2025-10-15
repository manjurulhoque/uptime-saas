import { api } from "@/lib/api";
import type {
    Monitor,
    MonitorResponse,
    MonitorsResponse,
    CreateMonitorRequest,
    UpdateMonitorRequest,
    UpdateMonitorStatusRequest,
    MonitorChecksResponse,
    MonitorIncidentsResponse,
    MonitorStatsResponse,
    MonitorQueryParams,
} from "@/types/monitor";

export const monitorApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all monitors for the authenticated user
        getMonitors: builder.query<MonitorsResponse, void>({
            query: () => ({
                url: "monitors",
                method: "GET",
            }),
            providesTags: ["Monitor"],
        }),

        // Get a specific monitor by ID
        getMonitor: builder.query<MonitorResponse, number>({
            query: (id) => ({
                url: `monitors/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Monitor", id }],
        }),

        // Create a new monitor
        createMonitor: builder.mutation<MonitorResponse, CreateMonitorRequest>({
            query: (monitorData) => ({
                url: "monitors",
                method: "POST",
                body: monitorData,
            }),
            invalidatesTags: ["Monitor"],
        }),

        // Update a monitor
        updateMonitor: builder.mutation<
            MonitorResponse,
            { id: number; data: UpdateMonitorRequest }
        >({
            query: ({ id, data }) => ({
                url: `monitors/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Monitor", id },
                "Monitor",
            ],
        }),

        // Update monitor status (active/inactive)
        updateMonitorStatus: builder.mutation<
            MonitorResponse,
            { id: number; data: UpdateMonitorStatusRequest }
        >({
            query: ({ id, data }) => ({
                url: `monitors/${id}/status`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Monitor", id },
                "Monitor",
            ],
        }),

        // Delete a monitor
        deleteMonitor: builder.mutation<
            { success: boolean; message: string },
            number
        >({
            query: (id) => ({
                url: `monitors/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Monitor"],
        }),

        // Get monitor statistics
        getMonitorStats: builder.query<
            MonitorStatsResponse,
            { id: number; params?: MonitorQueryParams }
        >({
            query: ({ id, params = {} }) => ({
                url: `monitors/${id}/stats`,
                method: "GET",
                params,
            }),
            providesTags: (result, error, { id }) => [
                { type: "MonitorStats", id },
            ],
        }),

        // Get monitor checks
        getMonitorChecks: builder.query<
            MonitorChecksResponse,
            { id: number; params?: MonitorQueryParams }
        >({
            query: ({ id, params = {} }) => ({
                url: `monitors/${id}/checks`,
                method: "GET",
                params,
            }),
            providesTags: (result, error, { id }) => [
                { type: "MonitorChecks", id },
            ],
        }),

        // Get monitor incidents
        getMonitorIncidents: builder.query<
            MonitorIncidentsResponse,
            { id: number; params?: MonitorQueryParams }
        >({
            query: ({ id, params = {} }) => ({
                url: `monitors/${id}/incidents`,
                method: "GET",
                params,
            }),
            providesTags: (result, error, { id }) => [
                { type: "MonitorIncidents", id },
            ],
        }),
    }),
});

// Export hooks for use in components
export const {
    useGetMonitorsQuery,
    useGetMonitorQuery,
    useCreateMonitorMutation,
    useUpdateMonitorMutation,
    useUpdateMonitorStatusMutation,
    useDeleteMonitorMutation,
    useGetMonitorStatsQuery,
    useGetMonitorChecksQuery,
    useGetMonitorIncidentsQuery,
} = monitorApi;
