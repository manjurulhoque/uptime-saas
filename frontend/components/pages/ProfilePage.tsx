"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    User,
    Mail,
    Save,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import {
    useGetProfileQuery,
    useUpdateProfileMutation,
    UpdateProfileRequest,
} from "@/store/api/profileApi";
import { useToast } from "@/hooks/use-toast";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";

export default function ProfilePage() {
    const { toast } = useToast();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const [emailError, setEmailError] = useState("");

    const { data: profileData, isLoading, error } = useGetProfileQuery();
    const [updateProfile] = useUpdateProfileMutation();

    const user = profileData?.data?.user;

    // Initialize form with profile data
    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || "");
            setLastName(user.last_name || "");
            setEmail(user.email || "");
        }
    }, [user]);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleFirstNameChange = (value: string) => {
        setFirstName(value);
        setFirstNameError("");

        if (value.trim() && value.trim().length < 1) {
            setFirstNameError("First name is required");
        }
    };

    const handleLastNameChange = (value: string) => {
        setLastName(value);
        setLastNameError("");

        if (value.trim() && value.trim().length < 1) {
            setLastNameError("Last name is required");
        }
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        setEmailError("");

        if (value && !validateEmail(value)) {
            setEmailError("Please provide a valid email address");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        setFirstNameError("");
        setLastNameError("");
        setEmailError("");

        let hasErrors = false;

        if (!firstName.trim()) {
            setFirstNameError("First name is required");
            hasErrors = true;
        }

        if (!lastName.trim()) {
            setLastNameError("Last name is required");
            hasErrors = true;
        }

        if (!email.trim()) {
            setEmailError("Email is required");
            hasErrors = true;
        } else if (!validateEmail(email)) {
            setEmailError("Please provide a valid email address");
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        setIsSubmitting(true);

        try {
            const updateData: UpdateProfileRequest = {};

            // Only include fields that have changed
            if (firstName !== user?.first_name) {
                updateData.first_name = firstName.trim();
            }
            if (lastName !== user?.last_name) {
                updateData.last_name = lastName.trim();
            }
            if (email !== user?.email) {
                updateData.email = email.trim();
            }

            if (Object.keys(updateData).length === 0) {
                toast({
                    title: "No changes",
                    description: "No changes were made to your profile.",
                });
                return;
            }

            await updateProfile(updateData).unwrap();

            toast({
                title: "Profile updated successfully",
                description: "Your profile has been updated",
            });
        } catch (error: any) {
            let errorMessage = "Failed to update profile. Please try again.";

            if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (error?.data?.error) {
                errorMessage = error.data.error;
            } else if (
                error?.data?.errors &&
                Array.isArray(error.data.errors)
            ) {
                errorMessage = error.data.errors
                    .map((err: any) => err.message)
                    .join(", ");
            }

            toast({
                title: "Error updating profile",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid =
        firstName.trim() &&
        lastName.trim() &&
        email.trim() &&
        validateEmail(email) &&
        !isSubmitting;

    if (isLoading) {
        return (
            <SidebarInset>
                <div className="flex flex-col">
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-semibold">
                                Loading...
                            </h1>
                        </div>
                    </header>
                    <div className="flex-1 p-4">
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="text-gray-600 mt-2">
                                Loading profile details...
                            </p>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        );
    }

    if (error || !user) {
        return (
            <SidebarInset>
                <div className="flex flex-col">
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="flex items-center gap-2">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                            <h1 className="text-lg font-semibold">
                                Profile Error
                            </h1>
                        </div>
                    </header>
                    <div className="flex-1 p-4">
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Failed to load profile
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Unable to load your profile information. Please
                                try refreshing the page.
                            </p>
                            <Link href="/dashboard">
                                <Button>Back to Dashboard</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        );
    }

    return (
        <SidebarInset>
            <div className="flex flex-col">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <h1 className="text-lg font-semibold">
                            Profile Settings
                        </h1>
                    </div>
                </header>

                <div className="flex-1 p-4">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-8">
                            <p className="text-gray-600">
                                Update your profile information
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">
                                                First Name
                                            </Label>
                                            <Input
                                                id="first_name"
                                                placeholder="Enter your first name"
                                                value={firstName}
                                                onChange={(e) =>
                                                    handleFirstNameChange(
                                                        e.target.value
                                                    )
                                                }
                                                className={
                                                    firstNameError
                                                        ? "border-red-500"
                                                        : ""
                                                }
                                            />
                                            {firstNameError && (
                                                <Alert variant="destructive">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        {firstNameError}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="last_name">
                                                Last Name
                                            </Label>
                                            <Input
                                                id="last_name"
                                                placeholder="Enter your last name"
                                                value={lastName}
                                                onChange={(e) =>
                                                    handleLastNameChange(
                                                        e.target.value
                                                    )
                                                }
                                                className={
                                                    lastNameError
                                                        ? "border-red-500"
                                                        : ""
                                                }
                                            />
                                            {lastNameError && (
                                                <Alert variant="destructive">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        {lastNameError}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChange={(e) =>
                                                handleEmailChange(
                                                    e.target.value
                                                )
                                            }
                                            className={
                                                emailError
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                        {emailError && (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    {emailError}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                        <p className="text-sm text-gray-600">
                                            This email will be used for account
                                            notifications and password resets.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Account Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        Account Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Account Type</Label>
                                                <div className="flex items-center">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                            user?.is_admin
                                                                ? "bg-purple-100 text-purple-800"
                                                                : "bg-blue-100 text-blue-800"
                                                        }`}
                                                    >
                                                        {user?.is_admin
                                                            ? "Admin"
                                                            : "User"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Status</Label>
                                                <div className="flex items-center">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                            user?.is_active
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {user?.is_active
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Member Since</Label>
                                                <p className="text-sm text-gray-600">
                                                    {user?.created_at
                                                        ? new Date(
                                                              user.created_at
                                                          ).toLocaleDateString()
                                                        : "N/A"}
                                                </p>
                                            </div>
                                            {user?.updated_at && (
                                                <div className="space-y-2">
                                                    <Label>Last Updated</Label>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(
                                                            user.updated_at
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Profile Summary */}
                            {firstName &&
                                lastName &&
                                email &&
                                validateEmail(email) && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                Profile Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Name:
                                                    </span>
                                                    <span className="font-medium">
                                                        {firstName} {lastName}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Email:
                                                    </span>
                                                    <span className="font-medium">
                                                        {email}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Account Type:
                                                    </span>
                                                    <span className="font-medium text-ship-cove-600">
                                                        {user?.is_admin
                                                            ? "Admin"
                                                            : "User"}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                                <Link href="/dashboard">
                                    <Button variant="outline">Cancel</Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={!isFormValid}
                                    className="flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Updating Profile...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Update Profile
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </SidebarInset>
    );
}
