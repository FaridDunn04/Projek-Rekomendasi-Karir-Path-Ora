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
  if (error && typeof error === "object" && "message" in error) {
    const apiError = error as ApiError;
    const code = apiError.code?.toLowerCase();
    if (
      code === "timeout" ||
      apiError.status === 504 ||
      apiError.message.toLowerCase().includes("tidak merespons")
    ) {
      return apiError.message || "Layanan AI tidak merespons. Coba lagi.";
    }
    if (
      code === "invalid_response" ||
      apiError.message.toLowerCase().includes("bukan json")
    ) {
      return apiError.message || "Respons AI tidak valid. Coba analisis ulang.";
    }
    if (code === "upstream_error" || apiError.status === 502) {
      return apiError.message || "Layanan AI sedang bermasalah. Coba lagi.";
    }
    if (typeof apiError.message === "string" && apiError.message.trim()) {
      return apiError.message;
    }
  }

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
        return apiMsg ?? "Sesi Anda berakhir. Silakan login kembali.";
      case 403:
        return "Akses ditolak.";
      case 409:
        return apiMsg ?? "Data sudah terdaftar.";
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
 * Parse error khusus ketika CV sedang dikirim ke layanan AI.
 * Pesannya dibuat lebih jelas untuk user yang baru saja upload CV.
 */
export function parseAnalyzeCvError(error: unknown): string {
  const fallbackMessage =
    "CV Anda belum berhasil dianalisis. Silakan upload file lagi beberapa saat lagi.";

  if (error && typeof error === "object" && "message" in error) {
    const apiError = error as ApiError;
    const code = apiError.code?.toLowerCase();
    const message = apiError.message?.toLowerCase() ?? "";
    const status = apiError.status;

    if (
      code === "timeout" ||
      code === "timeout_error" ||
      status === 504 ||
      message.includes("tidak merespons") ||
      message.includes("timeout")
    ) {
      return "Analisis CV membutuhkan waktu terlalu lama karena layanan AI belum merespons. Silakan upload file lagi dan coba beberapa saat lagi.";
    }

    if (
      code === "invalid_response" ||
      message.includes("bukan json") ||
      message.includes("tidak valid")
    ) {
      return "Layanan AI mengirim hasil yang belum bisa dibaca oleh Path`Ora. Silakan upload file lagi untuk memulai analisis baru.";
    }

    if (
      code === "upstream_error" ||
      status === 502 ||
      status === 503 ||
      (typeof status === "number" && status >= 500)
    ) {
      return "Layanan AI sedang mengalami gangguan saat membaca CV Anda. File belum bisa dianalisis, silakan upload ulang beberapa saat lagi.";
    }

    if (status === 400 || status === 422) {
      return "CV belum bisa dianalisis. Pastikan file berisi teks CV yang jelas, tidak terkunci, dan formatnya PDF";
    }

    if (status === 401) {
      return "Sesi Anda sudah berakhir. Silakan login kembali sebelum melakukan analisis CV.";
    }

    if (status === 403) {
      return "Anda tidak memiliki akses untuk menganalisis CV ini. Silakan upload CV baru dari akun Anda.";
    }

    if (status === 404) {
      return "CV yang akan dianalisis tidak ditemukan. Silakan upload CV lagi.";
    }
  }

  if (isNetworkError(error)) {
    return "Koneksi ke server terputus saat memulai analisis CV. Periksa internet Anda lalu upload file lagi.";
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 504 || error.code === "ECONNABORTED") {
      return "Analisis CV membutuhkan waktu terlalu lama. Silakan upload file lagi dan coba beberapa saat lagi.";
    }

    if (typeof status === "number" && status >= 500) {
      return "Server analisis sedang bermasalah. Silakan upload file lagi beberapa saat lagi.";
    }
  }

  return fallbackMessage;
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
