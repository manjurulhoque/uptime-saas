import {
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    api,
    API_ENDPOINTS,
} from "@/lib/api";
import type {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    RefreshTokenRequest,
} from "@/types/auth";

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: API_ENDPOINTS.AUTH.LOGIN,
                method: "POST",
                body: credentials,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data.success && typeof window !== "undefined") {
                        localStorage.setItem(
                            ACCESS_TOKEN_KEY,
                            data.data.tokens.access_token
                        );
                        localStorage.setItem(
                            REFRESH_TOKEN_KEY,
                            data.data.tokens.refresh_token
                        );
                    }
                } catch (error) {
                    console.error("Login failed:", error);
                }
            },
            invalidatesTags: ["Auth", "User"],
        }),

        register: builder.mutation<AuthResponse, RegisterRequest>({
            query: (userData) => ({
                url: API_ENDPOINTS.AUTH.REGISTER,
                method: "POST",
                body: userData,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    console.log("Registration data:", data);
                    if (data.success && typeof window !== "undefined") {
                        localStorage.setItem(
                            ACCESS_TOKEN_KEY,
                            data.data.tokens.access_token
                        );
                        localStorage.setItem(
                            REFRESH_TOKEN_KEY,
                            data.data.tokens.refresh_token
                        );
                    }
                } catch (error) {
                    console.error("Registration failed:", error);
                }
            },
            invalidatesTags: ["Auth", "User"],
        }),
        refreshToken: builder.mutation<AuthResponse, RefreshTokenRequest>({
            query: (refreshData) => ({
                url: API_ENDPOINTS.AUTH.REFRESH,
                method: "POST",
                body: refreshData,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data.success && typeof window !== "undefined") {
                        localStorage.setItem(
                            ACCESS_TOKEN_KEY,
                            data.data.tokens.access_token
                        );
                        localStorage.setItem(
                            REFRESH_TOKEN_KEY,
                            data.data.tokens.refresh_token
                        );
                    }
                } catch (error) {
                    console.error("Token refresh failed:", error);
                    if (typeof window !== "undefined") {
                        localStorage.removeItem(ACCESS_TOKEN_KEY);
                        localStorage.removeItem(REFRESH_TOKEN_KEY);
                        window.location.href = "/login";
                    }
                }
            },
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useRefreshTokenMutation,
} = authApi;
