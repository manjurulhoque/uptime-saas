import MonitorsListPage from "@/components/pages/MonitorsListPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Monitors",
    description: "Monitors",
};

export default function MonitorsPage() {
    return <MonitorsListPage />;
}
