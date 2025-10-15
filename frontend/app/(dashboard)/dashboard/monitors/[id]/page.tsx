import MonitorDetailPage from "@/components/pages/MonitorDetailPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Monitor Detail",
    description: "Monitor Detail",
};

export default function MonitorDetailPageRoute() {
    return <MonitorDetailPage />;
}
