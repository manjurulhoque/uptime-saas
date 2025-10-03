"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginRequest } from "@/types/auth";

export function useAuth() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isActionLoading, setIsActionLoading] = useState(false);

    const login = async (credentials: LoginRequest) => {
        setIsActionLoading(true);
        try {
            const result = await signIn("credentials", {
                email: credentials.email,
                password: credentials.password,
                redirect: false,
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            if (result?.ok) {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (error) {
            throw error;
        } finally {
            setIsActionLoading(false);
        }
    };

    const logout = async () => {
        setIsActionLoading(true);
        try {
            await signOut({ redirect: false });
            router.push("/login");
            router.refresh();
        } finally {
            setIsActionLoading(false);
        }
    };

    const isAuthenticated = status === "authenticated";
    const isAdmin = session?.user?.is_admin || false;
    const isActive = session?.user?.is_active || false;

    // isLoading should be true when session is loading OR when performing auth actions
    const isLoading = status === "loading" || isActionLoading;

    return {
        session,
        status,
        isLoading,
        isActionLoading,
        isAuthenticated,
        isAdmin,
        isActive,
        login,
        logout,
    };
}
