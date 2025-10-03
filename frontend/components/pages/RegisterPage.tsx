"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRegisterMutation } from "@/store/api/authApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const RegisterPage = () => {
    const [isClient, setIsClient] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
    });
    const [register, { isLoading, error: registerError }] = useRegisterMutation();
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div>Loading...</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(formData);
            if (registerError) {
                toast.error("Registration failed");
            } else {
                toast.success("Registration successful");
                router.push("/login");
            }
        } catch (error) {
            console.error("Registration failed:", error);
            console.error("Registration error:", registerError);
            toast.error(error instanceof Error ? error.message : "Registration failed");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Start monitoring your websites in minutes
                    </p>
                </div>

                {/* Registration Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="first_name"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                First name
                            </label>
                            <input
                                id="first_name"
                                name="first_name"
                                type="text"
                                autoComplete="first_name"
                                required
                                value={formData.first_name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your first name"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="last_name"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Last name
                            </label>
                            <input
                                id="last_name"
                                name="last_name"
                                type="text"
                                autoComplete="last_name"
                                required
                                value={formData.last_name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your last name"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Create a password"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Must be at least 8 characters long
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="confirm_password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Confirm password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirm_password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={formData.confirm_password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Confirm your password"
                            />
                        </div>

                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="agreeToTerms"
                                    name="agreeToTerms"
                                    type="checkbox"
                                    required
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label
                                    htmlFor="agreeToTerms"
                                    className="text-gray-700"
                                >
                                    I agree to the{" "}
                                    <a
                                        href="#"
                                        className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                    >
                                        Terms of Service
                                    </a>{" "}
                                    and{" "}
                                    <a
                                        href="#"
                                        className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                    >
                                        Privacy Policy
                                    </a>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
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
                                    Creating account...
                                </div>
                            ) : (
                                "Create account"
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

                {/* Sign in link */}
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Sign in
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
                            {/* Server rack illustration */}
                            <rect
                                x="80"
                                y="60"
                                width="240"
                                height="200"
                                rx="4"
                                fill="#E5E7EB"
                                stroke="#9CA3AF"
                                strokeWidth="2"
                            />

                            {/* Server units */}
                            <rect
                                x="90"
                                y="80"
                                width="220"
                                height="30"
                                rx="2"
                                fill="#F3F4F6"
                                stroke="#D1D5DB"
                                strokeWidth="1"
                            />
                            <rect
                                x="90"
                                y="120"
                                width="220"
                                height="30"
                                rx="2"
                                fill="#F3F4F6"
                                stroke="#D1D5DB"
                                strokeWidth="1"
                            />
                            <rect
                                x="90"
                                y="160"
                                width="220"
                                height="30"
                                rx="2"
                                fill="#F3F4F6"
                                stroke="#D1D5DB"
                                strokeWidth="1"
                            />
                            <rect
                                x="90"
                                y="200"
                                width="220"
                                height="30"
                                rx="2"
                                fill="#F3F4F6"
                                stroke="#D1D5DB"
                                strokeWidth="1"
                            />

                            {/* Status LEDs */}
                            <circle cx="100" cy="95" r="3" fill="#10B981" />
                            <circle cx="100" cy="135" r="3" fill="#10B981" />
                            <circle cx="100" cy="175" r="3" fill="#EF4444" />
                            <circle cx="100" cy="215" r="3" fill="#F59E0B" />

                            {/* Network connections */}
                            <path
                                d="M50 95 L90 95"
                                stroke="#3B82F6"
                                strokeWidth="2"
                            />
                            <path
                                d="M50 135 L90 135"
                                stroke="#3B82F6"
                                strokeWidth="2"
                            />
                            <path
                                d="M50 175 L90 175"
                                stroke="#EF4444"
                                strokeWidth="2"
                            />
                            <path
                                d="M50 215 L90 215"
                                stroke="#F59E0B"
                                strokeWidth="2"
                            />

                            {/* Floating elements */}
                            <circle
                                cx="60"
                                cy="40"
                                r="2"
                                fill="#3B82F6"
                                opacity="0.6"
                            />
                            <circle
                                cx="320"
                                cy="50"
                                r="3"
                                fill="#10B981"
                                opacity="0.6"
                            />
                            <circle
                                cx="350"
                                cy="30"
                                r="2"
                                fill="#F59E0B"
                                opacity="0.6"
                            />

                            {/* Data flow lines */}
                            <path
                                d="M330 95 L350 85 L370 95 L390 85"
                                stroke="#3B82F6"
                                strokeWidth="2"
                                fill="none"
                                opacity="0.7"
                            />
                            <path
                                d="M330 135 L350 125 L370 135 L390 125"
                                stroke="#10B981"
                                strokeWidth="2"
                                fill="none"
                                opacity="0.7"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
