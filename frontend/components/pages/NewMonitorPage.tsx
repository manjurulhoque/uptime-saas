"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    ArrowLeft,
    Globe,
    Clock,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useCreateMonitorMutation } from "@/store/api/monitorApi";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

const INTERVAL_OPTIONS = [
    { value: 1, label: "1 minute", description: "High frequency monitoring" },
    { value: 2, label: "2 minutes", description: "Frequent monitoring" },
    { value: 5, label: "5 minutes", description: "Standard monitoring" },
    { value: 10, label: "10 minutes", description: "Regular monitoring" },
    { value: 15, label: "15 minutes", description: "Moderate monitoring" },
    { value: 30, label: "30 minutes", description: "Low frequency monitoring" },
    { value: 60, label: "1 hour", description: "Infrequent monitoring" },
];

export default function NewMonitorPage() {
    const [url, setUrl] = useState("");
    const [interval, setInterval] = useState<number>(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [urlError, setUrlError] = useState("");

    const { toast } = useToast();
    const router = useRouter();
    const [createMonitor] = useCreateMonitorMutation();

    const validateUrl = (url: string): boolean => {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === "http:" || urlObj.protocol === "https:";
        } catch {
            return false;
        }
    };

    const handleUrlChange = (value: string) => {
        setUrl(value);
        setUrlError("");

        if (value && !validateUrl(value)) {
            setUrlError("Please enter a valid URL (e.g., https://example.com)");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url.trim()) {
            setUrlError("URL is required");
            return;
        }

        if (!validateUrl(url)) {
            setUrlError("Please enter a valid URL");
            return;
        }

        setIsSubmitting(true);

        try {
            await createMonitor({
                url: url.trim(),
                interval,
            }).unwrap();

            toast({
                title: "Monitor created successfully",
                description: `Monitoring started for ${url}`,
            });

            router.push("/dashboard/monitors");
        } catch (error: any) {
            toast({
                title: "Error creating monitor",
                description: error?.data?.error || "Failed to create monitor",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = url.trim() && validateUrl(url) && !isSubmitting;

    return (
        <SidebarInset>
            <div className="flex flex-col">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard/monitors">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Monitors
                            </Button>
                        </Link>
                        <h1 className="text-lg font-semibold">
                            Add New Monitor
                        </h1>
                    </div>
                </header>

                <div className="flex-1 p-4">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-8">
                            <p className="text-gray-600">
                                Add a new website or API endpoint to monitor
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* URL Input */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="h-5 w-5" />
                                        Website URL
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="url">
                                            URL to monitor
                                        </Label>
                                        <Input
                                            id="url"
                                            type="url"
                                            placeholder="https://example.com"
                                            value={url}
                                            onChange={(e) =>
                                                handleUrlChange(e.target.value)
                                            }
                                            className={
                                                urlError ? "border-red-500" : ""
                                            }
                                        />
                                        {urlError && (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    {urlError}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p>
                                            Enter the full URL including the
                                            protocol (http:// or https://)
                                        </p>
                                        <p className="mt-1">Examples:</p>
                                        <ul className="list-disc list-inside ml-4 space-y-1">
                                            <li>https://example.com</li>
                                            <li>
                                                https://api.example.com/health
                                            </li>
                                            <li>http://staging.example.com</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Interval Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Check Interval
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="interval">
                                            How often to check
                                        </Label>
                                        <Select
                                            value={interval.toString()}
                                            onValueChange={(value) =>
                                                setInterval(Number(value))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select check interval" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {INTERVAL_OPTIONS.map(
                                                    (option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value.toString()}
                                                        >
                                                            <div>
                                                                <div className="font-medium">
                                                                    {
                                                                        option.label
                                                                    }
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {
                                                                        option.description
                                                                    }
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p>
                                            Choose how frequently you want to
                                            check the URL:
                                        </p>
                                        <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                                            <li>
                                                <strong>1-2 minutes:</strong>{" "}
                                                For critical services
                                            </li>
                                            <li>
                                                <strong>5-10 minutes:</strong>{" "}
                                                For most websites and APIs
                                            </li>
                                            <li>
                                                <strong>15-30 minutes:</strong>{" "}
                                                For less critical services
                                            </li>
                                            <li>
                                                <strong>1 hour:</strong> For
                                                development/staging environments
                                            </li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Summary */}
                            {url && validateUrl(url) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            Monitor Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    URL:
                                                </span>
                                                <span className="font-medium">
                                                    {url}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Check Interval:
                                                </span>
                                                <span className="font-medium">
                                                    {
                                                        INTERVAL_OPTIONS.find(
                                                            (opt) =>
                                                                opt.value ===
                                                                interval
                                                        )?.label
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Status:
                                                </span>
                                                <span className="font-medium text-ship-cove-600">
                                                    Will be Active
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                                <Link href="/dashboard/monitors">
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
                                            Creating Monitor...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4" />
                                            Create Monitor
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
