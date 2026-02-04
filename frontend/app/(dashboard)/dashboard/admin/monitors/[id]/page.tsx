import AdminMonitorDetailPage from "@/components/pages/AdminMonitorDetailPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Monitor Details",
    description: "Admin Monitor Details",
};

export default function AdminMonitorDetail() {
    return <AdminMonitorDetailPage />;
}
