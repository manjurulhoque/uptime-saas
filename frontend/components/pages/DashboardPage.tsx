"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Upload,
    Search,
    Filter,
} from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardPage() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <SidebarInset>
            <div className="flex flex-col">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-semibold">
                            Dashboard Overview
                        </h1>
                    </div>
                </header>

                <div className="flex-1 p-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <p className="text-gray-600">
                                Manage your dashboard and sharing preferences
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            
                        </div>

                        {/* Upload Section */}
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle>Quick Upload</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors">
                                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Drop files here or click to upload
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Support for all file types up to 100MB
                                    </p>
                                    <Button>Choose Files</Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Files */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Files</CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search files..."
                                                className="pl-10 w-64"
                                                value={searchTerm}
                                                onChange={(e) =>
                                                    setSearchTerm(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Filter className="h-4 w-4 mr-2" />
                                            Filter
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </SidebarInset>
    );
}
