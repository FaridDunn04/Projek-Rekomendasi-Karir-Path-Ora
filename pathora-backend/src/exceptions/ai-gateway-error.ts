/**
 * exceptions/ai-gateway-error.ts
 *
 * Dilempar oleh AI Gateway layer ketika komunikasi ke layanan AI gagal.
 * Membawa `type` untuk membedakan tiga skenario kegagalan yang masing-masing
 * dipetakan ke HTTP status code berbeda (SDD §3.2, §7.2, FR-013, NFR-009):
 *
 *  - 'timeout'          → 504 Gateway Timeout   (AI tidak merespons dalam AI_TIMEOUT_MS)
 *  - 'upstream_error'   → 502 Bad Gateway        (AI mengembalikan 5xx)
 *  - 'invalid_response' → 422 Unprocessable      (respons AI tidak sesuai AiResponseSchema)
 *
 * Prinsip graceful degradation: error ini selalu ditangkap di
 * `trigger-analysis.use-case.ts`, status analisis diubah ke 'failed',
 * lalu error diteruskan ke error handler — tidak pernah crash proses (NFR-009).
 */

import { HttpException } from "@/exceptions/base-error";

export type AiErrorType = "timeout" | "upstream_error" | "invalid_response";

const HTTP_STATUS: Record<AiErrorType, number> = {
  timeout: 504,
  upstream_error: 502,
  invalid_response: 422,
};

const DEFAULT_MESSAGE: Record<AiErrorType, string> = {
  timeout: "Layanan AI tidak merespons dalam batas waktu yang ditentukan",
  upstream_error: "Layanan AI mengalami kesalahan internal",
  invalid_response:
    "Respons dari layanan AI tidak sesuai format yang diharapkan",
};

export class AiGatewayError extends HttpException {
  constructor(
    /** Jenis kegagalan AI — menentukan HTTP status code */
    public readonly type: AiErrorType,
    message?: string,
    details?: unknown,
  ) {
    super(HTTP_STATUS[type], message ?? DEFAULT_MESSAGE[type], details);
  }
}
