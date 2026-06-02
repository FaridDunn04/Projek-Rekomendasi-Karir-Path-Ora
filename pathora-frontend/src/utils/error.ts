/**
 * Error Handling Utilities
 * Sesuai SDD §20 - Utility Design & SRS §3.7 ERROR-004 & SEC-006
 */

import axios from "axios";
import { ApiError } from "../types/api";

export const isNetworkError = (error: unknown): boolean =>
  axios.isAxiosError(error) && !error.response;

/**
 * Parse API error menjadi user-friendly message
 * Sesuai SDD error handling design
 */
export function parseApiError(error: unknown): string {
  if (isNetworkError(error))
    return "Koneksi gagal. Periksa jaringan Anda lalu coba lagi.";

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as any;
    const apiMsg = data?.error?.message || data?.message;

    switch (status) {
      case 400:
        return apiMsg ?? "Request tidak valid.";
      case 401:
        return "Sesi Anda berakhir. Silakan login kembali.";
      case 403:
        return "Akses ditolak.";
      case 404:
        return apiMsg ?? "Data tidak ditemukan.";
      case 422:
        return apiMsg ?? "Input tidak valid.";
      case 500:
        return "Terjadi kesalahan pada server. Coba lagi nanti.";
      case 502:
        return "Layanan analisis sedang tidak tersedia. Coba lagi.";
      case 503:
        return "Server sedang dalam perbaikan. Coba lagi nanti.";
      case 504:
        return "Analisis memakan waktu terlalu lama. Coba lagi.";
      default:
        return apiMsg ?? "Terjadi kesalahan. Silakan coba lagi.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Terjadi kesalahan tak terduga.";
}

/**
 * Check apakah error adalah 401 Unauthorized
 */
export function isUnauthorizedError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

/**
 * Check apakah error adalah timeout
 */
export function isTimeoutError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.code === "ECONNABORTED";
}

/**
 * Check apakah error adalah validation error
 */
export function isValidationError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 422;
}

/**
 * Get validation field errors dari 422 response
 */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError(error) && error.response?.status === 422) {
    const data = error.response?.data as any;
    return data?.error?.fields ?? {};
  }
  return {};
}

/**
 * Get error code untuk telemetry/logging
 */
export function getErrorCode(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any;
    return data?.error?.code ?? `HTTP_${error.response?.status}`;
  }
  return "UNKNOWN_ERROR";
}
