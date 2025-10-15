"use client";

import "@/app/globals.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "sonner";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <Toaster />
                    <DashboardWrapper>{children}</DashboardWrapper>
                </Providers>
            </body>
        </html>
    );
}

function DashboardWrapper({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, status } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return; // Still loading, wait

        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, status, router]);

    // Show loading while checking authentication
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render dashboard if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <DashboardSidebar />
                {children}
            </div>
        </SidebarProvider>
    );
}
