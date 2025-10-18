"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Mail, Save, ArrowLeft, Link } from "lucide-react";
import {
    useGetProfileQuery,
    useUpdateProfileMutation,
    UpdateProfileRequest,
} from "@/store/api/profileApi";
import { useToast } from "@/hooks/use-toast";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import CenterLoader from "@/components/loaders/center-loader";

const profileSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Please provide a valid email address"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);

    const { data: profileData, isLoading, error } = useGetProfileQuery();
    const [updateProfile, { isLoading: isUpdating }] =
        useUpdateProfileMutation();

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
        watch,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
        },
    });

    // Update form when profile data loads
    React.useEffect(() => {
        if (profileData?.data?.user) {
            const user = profileData.data.user;
            reset({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email,
            });
        }
    }, [profileData, reset]);

    const onSubmit = async (data: ProfileFormData) => {
        try {
            const updateData: UpdateProfileRequest = {};

            // Only include fields that have changed
            if (data.first_name !== profileData?.data?.user?.first_name) {
                updateData.first_name = data.first_name;
            }
            if (data.last_name !== profileData?.data?.user?.last_name) {
                updateData.last_name = data.last_name;
            }
            if (data.email !== profileData?.data?.user?.email) {
                updateData.email = data.email;
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
                title: "Profile updated",
                description: "Your profile has been updated successfully.",
            });

            setIsEditing(false);
        } catch (error: any) {
            console.error("Profile update error:", error);

            let errorMessage = "Failed to update profile. Please try again.";

            if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (
                error?.data?.errors &&
                Array.isArray(error.data.errors)
            ) {
                errorMessage = error.data.errors
                    .map((err: any) => err.message)
                    .join(", ");
            }

            toast({
                title: "Update failed",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const handleCancel = () => {
        if (profileData?.data?.user) {
            const user = profileData.data.user;
            reset({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email,
            });
        }
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <CenterLoader />
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    Failed to load profile. Please try refreshing the page.
                </AlertDescription>
            </Alert>
        );
    }

    const user = profileData?.data?.user;

    return (
        <SidebarInset>
            <div className="flex flex-col">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard/monitors">
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
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <User className="h-5 w-5" />
                                        <CardTitle>Profile Settings</CardTitle>
                                    </div>
                                    {!isEditing && (
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEditing(true)}
                                            disabled={isUpdating}
                                        >
                                            Edit Profile
                                        </Button>
                                    )}
                                </div>
                                <CardDescription>
                                    Manage your account settings and personal
                                    information.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">
                                                First Name
                                            </Label>
                                            <Input
                                                id="first_name"
                                                {...register("first_name")}
                                                disabled={
                                                    !isEditing || isUpdating
                                                }
                                                className={
                                                    errors.first_name
                                                        ? "border-red-500"
                                                        : ""
                                                }
                                            />
                                            {errors.first_name && (
                                                <p className="text-sm text-red-500">
                                                    {errors.first_name.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="last_name">
                                                Last Name
                                            </Label>
                                            <Input
                                                id="last_name"
                                                {...register("last_name")}
                                                disabled={
                                                    !isEditing || isUpdating
                                                }
                                                className={
                                                    errors.last_name
                                                        ? "border-red-500"
                                                        : ""
                                                }
                                            />
                                            {errors.last_name && (
                                                <p className="text-sm text-red-500">
                                                    {errors.last_name.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                {...register("email")}
                                                disabled={
                                                    !isEditing || isUpdating
                                                }
                                                className={`pl-10 ${
                                                    errors.email
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-sm text-red-500">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Account Info */}
                                    <div className="pt-4 border-t">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                            Account Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">
                                                    Account Type:
                                                </span>
                                                <span
                                                    className={`ml-2 px-2 py-1 rounded-full text-xs ${
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
                                            <div>
                                                <span className="font-medium">
                                                    Status:
                                                </span>
                                                <span
                                                    className={`ml-2 px-2 py-1 rounded-full text-xs ${
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
                                            <div>
                                                <span className="font-medium">
                                                    Member since:
                                                </span>
                                                <span className="ml-2 text-muted-foreground">
                                                    {user?.created_at
                                                        ? new Date(
                                                              user.created_at
                                                          ).toLocaleDateString()
                                                        : "N/A"}
                                                </span>
                                            </div>
                                            {user?.updated_at && (
                                                <div>
                                                    <span className="font-medium">
                                                        Last updated:
                                                    </span>
                                                    <span className="ml-2 text-muted-foreground">
                                                        {new Date(
                                                            user.updated_at
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex justify-end space-x-2 pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCancel}
                                                disabled={isUpdating}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={
                                                    !isDirty || isUpdating
                                                }
                                            >
                                                {isUpdating ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </SidebarInset>
    );
}
