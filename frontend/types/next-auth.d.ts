import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            firstName: string;
            lastName: string;
            isAdmin: boolean;
            isActive: boolean;
        };
        accessToken: string;
        refreshToken: string;
    }

    interface User {
        id: string;
        email: string;
        name: string;
        firstName: string;
        lastName: string;
        isAdmin: boolean;
        isActive: boolean;
        emailVerified: boolean;
        accessToken: string;
        refreshToken: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken: string;
        refreshToken: string;
        isAdmin: boolean;
        isActive: boolean;
        firstName: string;
        lastName: string;
    }
}
