import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9900/api/v1";

export const ACCESS_TOKEN_KEY = "uptime_saas_access_token";
export const REFRESH_TOKEN_KEY = "uptime_saas_refresh_token";

// Custom base query with authentication and error handling
const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers, api) => {
        // Get token from NextAuth session
        const session = await getSession();
        const token = session?.access_token;

        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }

        if (api.endpoint === "uploadMultipleFiles") {
            // headers.set("Content-Type", "multipart/form-data");
        } else {
            headers.set("Content-Type", "application/json");
        }

        return headers;
    },
});

// Enhanced base query with error handling
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
    let result = await baseQuery(args, api, extraOptions);

    // If we get a 401, redirect to login (NextAuth will handle token refresh automatically)
    if (result.error && result.error.status === 401) {
        // if (typeof window !== "undefined") {
        //     window.location.href = "/login";
        // }
    }

    return result;
};

export const api = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: [
        "User",
        "Auth",
        "Profile",
        "Files",
        "Shares",
        "Dashboard",
        "FileCollaborators",
        "FolderCollaborators",
        "Collaborators",
    ],
    endpoints: () => ({}),
});

// Export hooks for use in components
export const { usePrefetch } = api;

// API Endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "auth/login/",
        REGISTER: "auth/register/",
        REFRESH: "auth/refresh/",
    },
} as const;
