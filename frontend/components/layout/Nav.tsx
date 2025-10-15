"use client";

import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

const Nav = () => {
    const { isAuthenticated } = useAuth();
    return (
        <nav className="relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm2 2a1 1 0 000 2h6a1 1 0 100-2H5z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                            UptimeSaaS
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <Link
                                href="/dashboard"
                                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                            >
                                Sign in
                            </Link>
                        )}
                        <Link
                            href="/register"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Nav;
