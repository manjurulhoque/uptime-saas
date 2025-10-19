"use client";

import React, { useState, useEffect } from "react";
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
    Save,
    Bell,
} from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
    useGetMonitorQuery,
    useUpdateMonitorMutation,
    useUpdateMonitorStatusMutation,
} from "@/store/api/monitorApi";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";

const INTERVAL_OPTIONS = [
    { value: 1, label: "1 minute", description: "High frequency monitoring" },
    { value: 2, label: "2 minutes", description: "Frequent monitoring" },
    { value: 5, label: "5 minutes", description: "Standard monitoring" },
    { value: 10, label: "10 minutes", description: "Regular monitoring" },
    { value: 15, label: "15 minutes", description: "Moderate monitoring" },
    { value: 30, label: "30 minutes", description: "Low frequency monitoring" },
    { value: 60, label: "1 hour", description: "Infrequent monitoring" },
];

export default function EditMonitorPage() {
    const params = useParams();
    const monitorId = parseInt(params.id as string);
    const [url, setUrl] = useState("");
    const [interval, setInterval] = useState<number>(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [urlError, setUrlError] = useState("");
    const [isActive, setIsActive] = useState<boolean>(true);

    // Alert settings state
    const [alertEnabled, setAlertEnabled] = useState<boolean>(true);
    const [alertEmail, setAlertEmail] = useState<string>("");
    const [alertOnDown, setAlertOnDown] = useState<boolean>(true);
    const [alertOnUp, setAlertOnUp] = useState<boolean>(false);
    const [alertOnSlow, setAlertOnSlow] = useState<boolean>(false);
    const [slowThreshold, setSlowThreshold] = useState<number>(5000);

    const router = useRouter();
    const [updateMonitor] = useUpdateMonitorMutation();
    const [updateMonitorStatus] = useUpdateMonitorStatusMutation();

    const {
        data: monitorData,
        isLoading: monitorLoading,
        error: monitorError,
    } = useGetMonitorQuery(monitorId);

    const monitor = monitorData?.data?.monitor;

    // Initialize form with monitor data
    useEffect(() => {
        console.log("monitor", monitor);
        if (monitor) {
            setUrl(monitor.url);
            setInterval(monitor.interval);
            setIsActive(monitor.is_active);

            // Initialize alert settings
            setAlertEnabled(monitor.alert_enabled);
            setAlertEmail(monitor.alert_email || "");
            setAlertOnDown(monitor.alert_on_down);
            setAlertOnUp(monitor.alert_on_up);
            setAlertOnSlow(monitor.alert_on_slow);
            setSlowThreshold(monitor.slow_threshold || 5000);
        }
    }, [monitor]);

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
            const updatePromises: Promise<any>[] = [];

            // Always update url/interval via main endpoint
            updatePromises.push(
                updateMonitor({
                    id: monitorId,
                    data: {
                        url: url.trim(),
                        interval,
                        isActive,
                        alert_enabled: alertEnabled,
                        alert_email: alertEmail || undefined,
                        alert_on_down: alertOnDown,
                        alert_on_up: alertOnUp,
                        alert_on_slow: alertOnSlow,
                        slow_threshold: alertOnSlow ? slowThreshold : undefined,
                    },
                }).unwrap()
            );

            await Promise.all(updatePromises);

            toast.success(`Monitor for ${url} has been updated`);

            router.push(`/dashboard/monitors/${monitorId}`);
        } catch (error: any) {
            toast.error(error?.data?.error || "Failed to update monitor");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = url.trim() && validateUrl(url) && !isSubmitting;

    if (monitorLoading) {
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
                                Loading monitor details...
                            </p>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        );
    }

    if (monitorError || !monitor) {
        return (
            <SidebarInset>
                <div className="flex flex-col">
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="flex items-center gap-2">
                            <Link href={`/dashboard/monitors/${monitorId}`}>
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Monitor
                                </Button>
                            </Link>
                            <h1 className="text-lg font-semibold">
                                Monitor Not Found
                            </h1>
                        </div>
                    </header>
                    <div className="flex-1 p-4">
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Monitor not found
                            </h3>
                            <p className="text-gray-600 mb-4">
                                The monitor you're trying to edit doesn't exist
                                or you don't have permission to edit it.
                            </p>
                            <Link href="/dashboard/monitors">
                                <Button>Back to Monitors</Button>
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
                        <Link href={`/dashboard/monitors/${monitorId}`}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Monitor
                            </Button>
                        </Link>
                        <h1 className="text-lg font-semibold">Edit Monitor</h1>
                    </div>
                </header>

                <div className="flex-1 p-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                Edit Monitor
                            </h2>
                            <p className="text-gray-600 mt-1">
                                Update your monitor settings
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Form Fields */}
                                <div className="space-y-6">
                                    {/* URL Input */}
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-lg">
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
                                                        handleUrlChange(
                                                            e.target.value
                                                        )
                                                    }
                                                    className={
                                                        urlError
                                                            ? "border-red-500"
                                                            : ""
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
                                                    Enter the full URL including
                                                    the protocol (http:// or
                                                    https://)
                                                </p>
                                                <p className="mt-2 font-medium">
                                                    Examples:
                                                </p>
                                                <ul className="list-disc list-inside ml-4 space-y-1 mt-1">
                                                    <li>https://example.com</li>
                                                    <li>
                                                        https://api.example.com/health
                                                    </li>
                                                    <li>
                                                        http://staging.example.com
                                                    </li>
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Interval Selection */}
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-lg">
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
                                                        setInterval(
                                                            Number(value)
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select check interval" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {INTERVAL_OPTIONS.map(
                                                            (option) => (
                                                                <SelectItem
                                                                    key={
                                                                        option.value
                                                                    }
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
                                                <p className="font-medium">
                                                    Recommended intervals:
                                                </p>
                                                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                                                    <li>
                                                        <strong>
                                                            1-2 minutes:
                                                        </strong>{" "}
                                                        Critical services
                                                    </li>
                                                    <li>
                                                        <strong>
                                                            5-10 minutes:
                                                        </strong>{" "}
                                                        Most websites and APIs
                                                    </li>
                                                    <li>
                                                        <strong>
                                                            15-30 minutes:
                                                        </strong>{" "}
                                                        Less critical services
                                                    </li>
                                                    <li>
                                                        <strong>1 hour:</strong>{" "}
                                                        Development/staging
                                                    </li>
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right Column - Status, Alerts, Summary and Actions */}
                                <div className="space-y-6">
                                    {/* Active Status */}
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <CheckCircle className="h-5 w-5" />
                                                Status
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <Label htmlFor="is-active">
                                                        Active
                                                    </Label>
                                                    <p className="text-sm text-gray-600">
                                                        Toggle to pause or
                                                        resume monitoring for
                                                        this URL.
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="is-active"
                                                    checked={isActive}
                                                    onCheckedChange={
                                                        setIsActive
                                                    }
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Alert Settings */}
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Bell className="h-5 w-5" />
                                                Alert Settings
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Enable Alerts */}
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <Label htmlFor="alert-enabled">
                                                        Enable Email Alerts
                                                    </Label>
                                                    <p className="text-sm text-gray-600">
                                                        Send email notifications
                                                        when this monitor
                                                        changes status.
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="alert-enabled"
                                                    checked={alertEnabled}
                                                    onCheckedChange={
                                                        setAlertEnabled
                                                    }
                                                />
                                            </div>

                                            {alertEnabled && (
                                                <>
                                                    {/* Alert Email */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="alert-email">
                                                            Alert Email Address
                                                        </Label>
                                                        <Input
                                                            id="alert-email"
                                                            type="email"
                                                            placeholder="alerts@example.com"
                                                            value={alertEmail}
                                                            onChange={(e) =>
                                                                setAlertEmail(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                        <p className="text-sm text-gray-600">
                                                            Leave empty to use
                                                            your account email
                                                            address.
                                                        </p>
                                                    </div>

                                                    {/* Alert Types */}
                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-medium">
                                                            Alert Conditions
                                                        </Label>

                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="space-y-1">
                                                                    <Label
                                                                        htmlFor="alert-down"
                                                                        className="text-sm"
                                                                    >
                                                                        When
                                                                        Monitor
                                                                        Goes
                                                                        Down
                                                                    </Label>
                                                                    <p className="text-xs text-gray-600">
                                                                        Alert
                                                                        when
                                                                        website
                                                                        becomes
                                                                        unreachable
                                                                    </p>
                                                                </div>
                                                                <Switch
                                                                    id="alert-down"
                                                                    checked={
                                                                        alertOnDown
                                                                    }
                                                                    onCheckedChange={
                                                                        setAlertOnDown
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="flex items-center justify-between">
                                                                <div className="space-y-1">
                                                                    <Label
                                                                        htmlFor="alert-up"
                                                                        className="text-sm"
                                                                    >
                                                                        When
                                                                        Monitor
                                                                        Comes
                                                                        Back Up
                                                                    </Label>
                                                                    <p className="text-xs text-gray-600">
                                                                        Alert
                                                                        when
                                                                        website
                                                                        becomes
                                                                        available
                                                                        again
                                                                    </p>
                                                                </div>
                                                                <Switch
                                                                    id="alert-up"
                                                                    checked={
                                                                        alertOnUp
                                                                    }
                                                                    onCheckedChange={
                                                                        setAlertOnUp
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="space-y-1">
                                                                        <Label
                                                                            htmlFor="alert-slow"
                                                                            className="text-sm"
                                                                        >
                                                                            When
                                                                            Response
                                                                            is
                                                                            Slow
                                                                        </Label>
                                                                        <p className="text-xs text-gray-600">
                                                                            Alert
                                                                            when
                                                                            response
                                                                            time
                                                                            exceeds
                                                                            threshold
                                                                        </p>
                                                                    </div>
                                                                    <Switch
                                                                        id="alert-slow"
                                                                        checked={
                                                                            alertOnSlow
                                                                        }
                                                                        onCheckedChange={
                                                                            setAlertOnSlow
                                                                        }
                                                                    />
                                                                </div>

                                                                {alertOnSlow && (
                                                                    <div className="space-y-2">
                                                                        <Label
                                                                            htmlFor="slow-threshold"
                                                                            className="text-sm"
                                                                        >
                                                                            Slow
                                                                            Response
                                                                            Threshold
                                                                            (ms)
                                                                        </Label>
                                                                        <Input
                                                                            id="slow-threshold"
                                                                            type="number"
                                                                            placeholder="5000"
                                                                            value={
                                                                                slowThreshold
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                setSlowThreshold(
                                                                                    Number(
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                )
                                                                            }
                                                                            min="1000"
                                                                            max="30000"
                                                                        />
                                                                        <p className="text-xs text-gray-600">
                                                                            Alert
                                                                            when
                                                                            response
                                                                            time
                                                                            exceeds
                                                                            this
                                                                            value
                                                                            (1000-30000ms)
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Summary */}
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                Monitor Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {url && validateUrl(url) ? (
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600 font-medium">
                                                            URL:
                                                        </span>
                                                        <span className="font-medium text-right break-all">
                                                            {url}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600 font-medium">
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
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600 font-medium">
                                                            Status:
                                                        </span>
                                                        <span className="font-medium text-ship-cove-600">
                                                            {isActive
                                                                ? "Active"
                                                                : "Paused"}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600 font-medium">
                                                            Email Alerts:
                                                        </span>
                                                        <span className="font-medium">
                                                            {alertEnabled
                                                                ? "Enabled"
                                                                : "Disabled"}
                                                        </span>
                                                    </div>
                                                    {alertEnabled && (
                                                        <>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-600 font-medium">
                                                                    Alert Email:
                                                                </span>
                                                                <span className="font-medium text-right break-all">
                                                                    {alertEmail ||
                                                                        "Account Email"}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-600 font-medium">
                                                                    Alert Types:
                                                                </span>
                                                                <span className="font-medium text-right">
                                                                    {[
                                                                        alertOnDown &&
                                                                            "Down",
                                                                        alertOnUp &&
                                                                            "Up",
                                                                        alertOnSlow &&
                                                                            "Slow",
                                                                    ]
                                                                        .filter(
                                                                            Boolean
                                                                        )
                                                                        .join(
                                                                            ", "
                                                                        ) ||
                                                                        "None"}
                                                                </span>
                                                            </div>
                                                            {alertOnSlow && (
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-gray-600 font-medium">
                                                                        Slow
                                                                        Threshold:
                                                                    </span>
                                                                    <span className="font-medium">
                                                                        {
                                                                            slowThreshold
                                                                        }
                                                                        ms
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-gray-500 text-sm">
                                                        Enter a valid URL to see
                                                        monitor summary
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Actions */}
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="space-y-4">
                                                <Button
                                                    type="submit"
                                                    disabled={!isFormValid}
                                                    className="w-full flex items-center justify-center gap-2"
                                                    size="lg"
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Updating Monitor...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="h-4 w-4" />
                                                            Update Monitor
                                                        </>
                                                    )}
                                                </Button>
                                                <Link
                                                    href={`/dashboard/monitors/${monitorId}`}
                                                    className="block"
                                                >
                                                    <Button
                                                        variant="outline"
                                                        className="w-full"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </SidebarInset>
    );
}
