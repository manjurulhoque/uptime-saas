import type { Metadata } from "next";
import "@/app/globals.css";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
    title: "UptimeSaaS - Professional Website Monitoring",
    description:
        "Monitor your websites with real-time uptime tracking, instant alerts, and detailed analytics. Professional website monitoring for businesses of all sizes.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
                <Toaster />
            </body>
        </html>
    );
}
