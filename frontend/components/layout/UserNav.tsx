"use client";

import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserNavProps {
    showChevron?: boolean;
    showName?: boolean;
    variant?: "default" | "compact";
    align?: "start" | "center" | "end";
}

const UserNav = ({
    showChevron = true,
    showName = true,
    variant = "default",
    align = "end",
}: UserNavProps) => {
    const { isAuthenticated, isLoading, logout, session } = useAuth();
    const user = session?.user;

    if (isLoading) {
        return (
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center space-x-4">
                <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                    Sign in
                </Link>
                <Link
                    href="/register"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                    Get Started
                </Link>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className={`flex items-center gap-2 ${
                            variant === "compact" ? "p-2" : ""
                        }`}
                    >
                        <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                        </div>
                        {showName && (
                            <span className="hidden md:block text-sm font-medium">
                                {user?.first_name || "Account"}
                            </span>
                        )}
                        {showChevron && <ChevronDown className="h-4 w-4" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={align} className="w-56">
                    <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user?.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                            <User className="h-4 w-4 mr-2" />
                            Dashboard
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                            <Settings className="h-4 w-4 mr-2" />
                            Profile Settings
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={logout}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default UserNav;
