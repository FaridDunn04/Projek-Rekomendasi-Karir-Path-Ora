import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { ENV } from "../constants/environment";
import { ApiError } from "../types/api";

// Helper store (segera diterapkan untuk Zustand auth.store.ts)
// import { useAuthStore } from "@/store/auth.store";

// Instance Axios utama sesuai dengan SDD bagian 2.2 dan 1.4
export const apiClient = axios.create({
    baseURL: ENV.API_BASE_URL,
    timeout: 10000, // Timeout default; Endpoint AI-analyze nantinya bisa di-override dengan ENV.AI_TIMEOUT_MS
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Menyisipkan JWT Token 
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // SDD 2.2: Interceptor inject token
        // Token di prototipe diambil dari localStorage. Nanti bisa diganti dengan useAuthStore.getState().token jika sudah pakai Zustand
        const token = localStorage.getItem("token"); 
        
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Normalisasi Error handling secara global (Sesuai SDD NFR-021)
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // SDD mensyaratkan kembalian data berupa ApiResponse<T>
        return response;
    },
    (error: AxiosError) => {
        let normalizedError: ApiError = {
            code: "UNKNOWN_ERROR",
            message: "Terjadi kesalahan tak terduga. Silakan coba lagi.",
        };

        if (error.response) {
            // Error yang dibalikkan dari endpoint backend (mis. status 400, 401, 422, 502)
            const data = error.response.data as any;
            normalizedError = {
                code: data?.error?.code || `HTTP_${error.response.status}`,
                message: data?.error?.message || "Kesalahan pada server.",
                fields: data?.error?.fields,
            };

            // SDD FR-003, SEC-004: Tangani auto-logout jika sesi sudah expired atau unauthenticated (401)
            if (error.response.status === 401) {
                // useAuthStore.getState().logout();
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
            
            // Penanganan graceful fallback jika layanan AI down berdasarkan PRD 10 dan SDD 5.1
            if (error.response.status === 502) {
                normalizedError.message = "Layanan analisis sedang tidak tersedia. Silakan coba lagi.";
                normalizedError.code = "AI_SERVICE_ERROR";
            }
        } else if (error.request) {
            // Ketika request tidak ada respon (misal jaringan down atau Timeout 504 / ECONNABORTED)
            if (error.code === "ECONNABORTED") {
                normalizedError.code = "TIMEOUT";
                normalizedError.message = "Proses memakan waktu terlalu lama. Silakan coba lagi.";
            } else {
                normalizedError.code = "NETWORK_ERROR";
                normalizedError.message = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
            }
        }

        // Return promise reject dengan error normal agar dapat ditangkap secara terstruktur di level Service/Hook
        return Promise.reject(normalizedError);
    }
);
