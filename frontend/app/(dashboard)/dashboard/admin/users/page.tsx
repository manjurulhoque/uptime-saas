import AdminUsersPage from "@/components/pages/AdminUsersPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Users",
    description: "Admin Users",
};

export default function AdminUsers() {
    return <AdminUsersPage />;
}
