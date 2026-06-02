

import { apiClient } from "./api.client.ts";
import { LoginRequest, RegisterRequest, LoginResponse, User } from "../types/auth.ts";

export const authService = {
  /**
   * Register pengguna baru
   * POST /auth/register
   */
  async register(payload: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<{ data: LoginResponse }>("/auth/register", {
        name: payload.name,
        email: payload.email,
        password: payload.password,
      });
      return response.data.data;
    } catch (error: any) {
      throw {
        code: error.response?.data?.error?.code || "REGISTER_ERROR",
        message: error.response?.data?.error?.message || "Pendaftaran gagal",
      };
    }
  },

  /**
   * Login pengguna
   * POST /auth/login
   */
  async login(payload: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<{ data: LoginResponse }>("/auth/login", payload);
      return response.data.data;
    } catch (error: any) {
      throw {
        code: error.response?.data?.error?.code || "LOGIN_ERROR",
        message: error.response?.data?.error?.message || "Login gagal",
      };
    }
  },

  /**
   * Logout (client-side hanya, token dihapus dari localStorage)
   */
  logout(): void {
    localStorage.removeItem("token");
  },

};