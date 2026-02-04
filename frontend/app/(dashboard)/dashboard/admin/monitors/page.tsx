import AdminMonitorsPage from "@/components/pages/AdminMonitorsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Monitors",
    description: "Admin Monitors",
};

export default function AdminMonitors() {
    return <AdminMonitorsPage />;
}
