/**
 * utils/response.ts
 *
 * Helper untuk membentuk respons HTTP yang konsisten di seluruh aplikasi.
 * Seluruh endpoint — sukses maupun error — menggunakan format:
 *
 *   { data: T | null, error: { message, details? } | null, meta: {} }
 *
 * (BTS-08, NFR-021, SDD §3.5)
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SuccessResponse<T> {
  data: T;
  error: null;
  meta: Record<string, unknown>;
}

export interface ErrorResponse {
  data: null;
  error: { message: string; details?: unknown };
  meta: Record<string, unknown>;
}

// ── Response Helpers ───────────────────────────────────────────────────────────

export const response = {
  /**
   * Membungkus data sukses.
   * @param data  - Payload yang dikembalikan ke klien
   * @param meta  - Metadata tambahan (mis. pagination: { limit, offset, total })
   */
  success<T>(data: T, meta: Record<string, unknown> = {}): SuccessResponse<T> {
    return { data, error: null, meta };
  },

  /**
   * Membungkus pesan error.
   * @param message  - Pesan error yang ditampilkan ke klien
   * @param details  - Detail tambahan (mis. field errors dari Zod) — opsional
   */
  error(message: string, details?: unknown): ErrorResponse {
    return {
      data: null,
      error: details !== undefined ? { message, details } : { message },
      meta: {},
    };
  },
};
