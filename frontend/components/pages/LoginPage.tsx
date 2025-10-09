"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CenterLoader from "../loaders/center-loader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLoginMutation } from "@/store/api/authApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const [isClient, setIsClient] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [login, { isLoading, error: loginError }] = useLoginMutation();
    const router = useRouter();
    const { isAuthenticated, session } = useAuth();
    console.log(session);
    console.log(isAuthenticated);

    // Initialize react-hook-form
    const {
        register: registerField,
        handleSubmit,
        setError,
        formState: { errors, isValid },
        clearErrors,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
    });

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (loginError && "data" in loginError) {
            const errorData = loginError.data as any;

            // Handle server validation errors
            if (
                errorData?.errors &&
                Array.isArray(errorData.errors)
            ) {
                errorData.errors.forEach(
                    (serverError: { field: string; message: string }) => {
                        // Map server field names to form field names if needed
                        const fieldName = serverError.field as keyof LoginFormData;
                        setError(fieldName, {
                            type: "server",
                            message: serverError.message,
                        });
                    }
                );
            } else {
                // Handle general errors
                toast.error(errorData?.error || "Login failed. Please try again.");
            }
        }
    }, [loginError, setError]);

    const onSubmit = async (data: LoginFormData) => {
        try {
            // Clear previous errors
            clearErrors();

            const result = await login(data);

            if (result.error) {
                // handle error
            } else {
                toast.success("Login successful");
                // router.push("/");
            }
        } catch (error) {
            // console.error("Login failed:", error);
            // toast.error("Login failed");
        }
    };

    if (!isClient) {
        return <CenterLoader />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to your UptimeSaaS account
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form
                        className="space-y-6"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                {...registerField("email")}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                    errors.email
                                        ? "border-red-300"
                                        : "border-gray-300"
                                }`}
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    {...registerField("password")}
                                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                        errors.password
                                            ? "border-red-300"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a
                                    href="#"
                                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                >
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !isValid}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Signing in...
                                </div>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span className="ml-2">Google</span>
                            </button>

                            <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                                <svg
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span className="ml-2">Facebook</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sign up link */}
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link
                            href="/register"
                            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Sign up for free
                        </Link>
                    </p>
                </div>

                {/* Illustration */}
                <div className="flex justify-center mt-8">
                    <div className="w-64 h-48 opacity-20">
                        <svg
                            viewBox="0 0 400 300"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Monitor illustration */}
                            <rect
                                x="50"
                                y="80"
                                width="300"
                                height="180"
                                rx="8"
                                fill="#E5E7EB"
                                stroke="#9CA3AF"
                                strokeWidth="2"
                            />
                            <rect
                                x="60"
                                y="90"
                                width="280"
                                height="120"
                                rx="4"
                                fill="#F3F4F6"
                            />

                            {/* Status indicators */}
                            <circle cx="80" cy="220" r="6" fill="#10B981" />
                            <text x="95" y="225" fontSize="12" fill="#374151">
                                Online
                            </text>

                            <circle cx="150" cy="220" r="6" fill="#EF4444" />
                            <text x="165" y="225" fontSize="12" fill="#374151">
                                Offline
                            </text>

                            <circle cx="220" cy="220" r="6" fill="#F59E0B" />
                            <text x="235" y="225" fontSize="12" fill="#374151">
                                Warning
                            </text>

                            {/* Chart lines */}
                            <path
                                d="M70 150 L120 130 L170 140 L220 120 L270 125 L320 110"
                                stroke="#3B82F6"
                                strokeWidth="3"
                                fill="none"
                            />
                            <path
                                d="M70 160 L120 150 L170 160 L220 140 L270 145 L320 130"
                                stroke="#10B981"
                                strokeWidth="2"
                                fill="none"
                            />

                            {/* Floating elements */}
                            <circle
                                cx="100"
                                cy="50"
                                r="3"
                                fill="#3B82F6"
                                opacity="0.6"
                            />
                            <circle
                                cx="300"
                                cy="60"
                                r="2"
                                fill="#10B981"
                                opacity="0.6"
                            />
                            <circle
                                cx="350"
                                cy="40"
                                r="4"
                                fill="#F59E0B"
                                opacity="0.6"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
