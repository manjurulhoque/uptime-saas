import EditMonitorPage from "@/components/pages/EditMonitorPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Monitor",
    description: "Edit Monitor",
};

export default function EditMonitorPageRoute() {
    return <EditMonitorPage />;
}
