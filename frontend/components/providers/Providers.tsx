"use client";

import { Provider } from "react-redux";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { store } from "@/store/store";

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <NextAuthSessionProvider>
            <Provider store={store}>{children}</Provider>
        </NextAuthSessionProvider>
    );
}

// Export individual providers for cases where we might need them separately
export function StoreProvider({ children }: ProvidersProps) {
    return <Provider store={store}>{children}</Provider>;
}

export function SessionProvider({ children }: ProvidersProps) {
    return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
