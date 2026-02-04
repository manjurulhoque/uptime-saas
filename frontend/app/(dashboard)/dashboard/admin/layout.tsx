"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isAdmin, status } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "loading") return;

        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        if (!isAdmin) {
            // User is authenticated but not admin
            router.push("/dashboard");
        }
    }, [isAuthenticated, isAdmin, status, router]);

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

    if (!isAuthenticated) {
        return null;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <CardTitle>Access Denied</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-600">
                            You don't have permission to access the admin dashboard. Admin
                            privileges are required.
                        </p>
                        <Link href="/dashboard">
                            <Button className="w-full">Go to Dashboard</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}
