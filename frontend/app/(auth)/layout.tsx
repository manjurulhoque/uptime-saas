import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "UptimeSaaS - Authentication",
    description: "Sign in or create an account to monitor your websites",
};

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                    {/* Header */}
                    <header className="absolute top-0 left-0 right-0 z-10">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center py-6">
                                <Link
                                    href="/"
                                    className="flex items-center space-x-2"
                                >
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
                                </Link>
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="relative">{children}</main>
                </div>
            </body>
        </html>
    );
}
