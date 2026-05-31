import axios from "axios";

export const isNetworkError = (error: unknown): boolean =>
    axios.isAxiosError(error) && !error.response;

export function parseApiError(error: unknown): string {
    if (isNetworkError(error)) return "Koneksi gagal. Periksa jaringan Anda lalu coba lagi.";
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const apiMsg = (error.response?.data as { error?: { message?: string } })?.error?.message;
        switch (status) {
            case 401:
                return "Sesi Anda berakhir. Silakan login kembali.";
            case 403:
                return "Akses ditolak.";
            case 404:
                return apiMsg ?? "Data tidak ditemukan.";
            case 422:
                return apiMsg ?? "Input tidak valid.";
            case 502:
                return "Layanan analisis sedang tidak tersedia. Coba lagi.";
            case 504:
                return "Analisis memakan waktu terlalu lama. Coba lagi.";
            default:
                return apiMsg ?? "Terjadi kesalahan pada server. Coba lagi.";
        }
    }
    return "Terjadi kesalahan tak terduga.";
}
