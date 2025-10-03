export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    is_admin: boolean;
    email_verified: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Tokens {
    access_token: string;
    refresh_token: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        tokens: Tokens;
    };
}

export interface RefreshTokenRequest {
    refresh_token: string;
}

export interface RefreshTokenResponse {
    success: boolean;
    message: string;
    data: {
        access_token: string;
        refresh_token: string;
    };
}
