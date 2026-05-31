// FR-1: Register Request/Response Types (SRS §3.1 — Autentikasi & Manajemen Sesi)
export interface RegisterRequest {
    full_name: string;
    email: string;
    password: string;
}

// FR-2: Login Request/Response Types (SRS §3.1)
export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface User {
    id: string;
    full_name: string;
    email: string;
    created_at?: string;
}

export interface AuthError {
    message: string;
    code: string;
}