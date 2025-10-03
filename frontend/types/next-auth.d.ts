import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            is_admin: boolean;
            is_active: boolean;
        };
        access_token: string;
        refresh_token: string;
    }

    interface User {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        is_admin: boolean;
        is_active: boolean;
        access_token: string;
        refresh_token: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        access_token: string;
        refresh_token: string;
        is_admin: boolean;
        is_active: boolean;
        first_name: string;
        last_name: string;
    }
}
