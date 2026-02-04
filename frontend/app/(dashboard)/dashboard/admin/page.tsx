import AdminDashboardPage from "@/components/pages/AdminDashboardPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Dashboard",
    description: "Admin Dashboard",
};

export default function AdminDashboard() {
    return <AdminDashboardPage />;
}
