import { apiClient } from "./api.client.ts";
import { LoginRequest, RegisterRequest, AuthResponse } from "../types/auth.ts";

/**
 * Auth Service - Handle authentication API calls (SDD 2.2 & SRS §3.1)
 * All requests go through apiClient which handles JWT injection & error normalization
 */
export const authService = {
    /**
     * Register new user (FR-1: Autentikasi & Manajemen Sesi)
     * Endpoint: POST /api/v1/auth/register
     */
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post("/auth/register", {
            full_name: data.full_name,
            email: data.email,
            password: data.password,
        });
        return response.data.data; // Sesuai API Contract Backend
    },

    /**
     * Login user (FR-2: Autentikasi & Manajemen Sesi)
     * Endpoint: POST /api/v1/auth/login
     */
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post("/auth/login", {
            email: data.email,
            password: data.password,
        });
        return response.data.data; // Sesuai API Contract Backend
    },

    /**
     * Logout user (clear token from localStorage & Zustand)
     * Note: Backend logout optional, mainly clear frontend state
     */
    logout: (): void => {
        localStorage.removeItem("token");
    },
};

export default authService;