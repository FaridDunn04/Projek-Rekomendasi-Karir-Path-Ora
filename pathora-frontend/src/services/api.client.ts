import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { ENV } from "../constants/environment";
import { ApiError } from "../types/api";


export const apiClient = axios.create({
    baseURL: ENV.API_BASE_URL,
    timeout: 10000, 
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Menyisipkan JWT Token 
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        
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
            
            const data = error.response.data as any;
            normalizedError = {
                code: data?.error?.code || `HTTP_${error.response.status}`,
                message: data?.error?.message || "Kesalahan pada server.",
                fields: data?.error?.fields,
            };

            
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
