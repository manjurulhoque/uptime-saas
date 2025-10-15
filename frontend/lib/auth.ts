import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthResponse, LoginRequest } from "@/types/auth";
import { JWT } from "next-auth/jwt";
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/api";
import { jwtDecode } from "jwt-decode";
import { ApiResponse } from "@/types/response";

async function refreshAccessToken(token: JWT) {
    try {
        if (!token.refreshToken) {
            return {
                error: "RefreshAccessTokenError",
            };
        }

        const response = await fetch(
            `${API_BASE_URL}/${API_ENDPOINTS.AUTH.REFRESH}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refresh_token: token.refreshToken,
                }),
            }
        );

        const refreshedTokens = (await response.json()) as ApiResponse<{
            tokens: {
                access_token: string;
                refresh_token: string;
            };
        }>;
        console.log("refreshedTokens", refreshedTokens);

        if (!response.ok) {
            throw refreshedTokens;
        }

        if (!refreshedTokens.success) {
            return {
                error: "RefreshAccessTokenError",
            };
        }

        return {
            accessToken: refreshedTokens.data?.tokens.access_token ?? "",
            refreshToken: refreshedTokens.data?.tokens.refresh_token ?? "",
            accessTokenExpires: Date.now() + 60 * 60 * 1000 * 24, // 1 day to match backend
            error: undefined,
        };
    } catch (error) {
        return {
            error: "RefreshAccessTokenError",
        };
    }
}

const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const response = await fetch(
                        `${API_BASE_URL}/${API_ENDPOINTS.AUTH.LOGIN}`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                email: credentials.email,
                                password: credentials.password,
                            } as LoginRequest),
                        }
                    );

                    if (!response.ok) {
                        return null;
                    }

                    const data: AuthResponse = await response.json();

                    if (data.success) {
                        return {
                            id: data.data.user.id,
                            email: data.data.user.email,
                            first_name: data.data.user.first_name,
                            last_name: data.data.user.last_name,
                            is_admin: data.data.user.is_admin,
                            is_active: data.data.user.is_active,
                            access_token: data.data.tokens.access_token,
                            refresh_token: data.data.tokens.refresh_token,
                        };
                    }

                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.access_token = user.access_token;
                token.refresh_token = user.refresh_token;
                token.is_admin = user.is_admin;
                token.is_active = user.is_active;
                token.first_name = user.first_name;
                token.last_name = user.last_name;
            }

            if (token.access_token) {
                const { exp } = jwtDecode(token.access_token as string);
                if (exp && exp < Date.now() / 1000) {
                    let refreshedTokens = await refreshAccessToken(token);
                    if (refreshedTokens.error) {
                        return {
                            ...token,
                            error: refreshedTokens.error,
                        };
                    }
                    // token.access_token = refreshedTokens.access_token as string;
                    // token.refresh_token = refreshedTokens.refresh_token as string;
                    // token.access_token_expires = refreshedTokens.access_token_expires as number;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub!;
                session.user.email = token.email!;
                session.user.first_name = token.first_name as string;
                session.user.last_name = token.last_name as string;
                session.user.is_admin = token.is_admin as boolean;
                session.user.is_active = token.is_active as boolean;
                session.access_token = token.access_token as string;
                session.refresh_token = token.refresh_token as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
        signOut: "/login",
        verifyRequest: "/login",
        newUser: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
