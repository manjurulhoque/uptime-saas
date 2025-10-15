import NewMonitorPage from "@/components/pages/NewMonitorPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "New Monitor",
    description: "New Monitor",
};

export default function NewMonitorPageRoute() {
    return <NewMonitorPage />;
}
