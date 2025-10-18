import { api, API_ENDPOINTS } from "@/lib/api";
import { ApiResponse } from "@/types/response";

export interface UserProfile {
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
    is_admin: boolean;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

export interface UpdateProfileRequest {
    first_name?: string;
    last_name?: string;
    email?: string;
}

export const profileApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getProfile: builder.query<ApiResponse<{ user: UserProfile }>, void>({
            query: () => ({
                url: API_ENDPOINTS.AUTH.ME,
                method: "GET",
            }),
            providesTags: ["Profile"],
        }),
        updateProfile: builder.mutation<
            ApiResponse<{ user: UserProfile }>,
            UpdateProfileRequest
        >({
            query: (data) => ({
                url: API_ENDPOINTS.AUTH.PROFILE,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Profile"],
        }),
    }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
