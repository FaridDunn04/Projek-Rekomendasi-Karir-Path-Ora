/**
 * services/ai-gateway/ai-gateway.http.ts
 *
 * Implementasi HTTP AI Gateway — memanggil layanan AI nyata via axios
 * (SDD §3.6, FR-013, NFR-003, NFR-009).
 *
 * Alur untuk kind='text':
 *   POST AI_BASE_URL/analyze  body: { cv_id, raw_text }
 *
 * Alur untuk kind='file' (revisi v1.1):
 *   POST AI_BASE_URL/analyze  multipart/form-data: { cv_id, file }
 *   Layanan AI yang mengekstrak teks dari berkas.
 *
 * Penanganan error (graceful degradation, NFR-009):
 *   - Timeout (ECONNABORTED)  → AiGatewayError('timeout')        → 504
 *   - AI error 5xx            → AiGatewayError('upstream_error') → 502
 *   - Respons tidak valid     → AiGatewayError('invalid_response')→ 422
 */

import axios from "axios";
import FormData from "form-data";
import { config } from "../../config";
import { validateAiResponse } from "../../utils/ai-schema-validator";
import { AiGatewayError } from "../../exceptions/ai-gateway-error";
import type { AiGatewayAdapter, CvSource } from "./ai-gateway.adapter";
import type { AiAnalysisResult } from "./ai-response.schema";

export class HttpAiGateway implements AiGatewayAdapter {
  async analyze(source: CvSource, cvId: string): Promise<AiAnalysisResult> {
    try {
      let responseData: unknown;

      if (source.kind === "text") {
        // ── Teks: kirim sebagai JSON ─────────────────────────────────────────
        const { data } = await axios.post(
          `${config.AI_BASE_URL}/analyze`,
          { cv_id: cvId, raw_text: source.rawText },
          { timeout: config.AI_TIMEOUT_MS },
        );
        responseData = data;
      } else {
        // ── Berkas: kirim sebagai multipart/form-data (revisi v1.1) ──────────
        // AI yang mengekstrak teks — backend hanya meneruskan buffer mentah
        const form = new FormData();
        form.append("cv_id", cvId);
        form.append("file", source.fileData, {
          filename: source.fileName ?? "cv",
          contentType: source.fileMime,
        });

        const { data } = await axios.post(
          `${config.AI_BASE_URL}/analyze`,
          form,
          {
            headers: form.getHeaders(),
            timeout: config.AI_TIMEOUT_MS,
          },
        );
        responseData = data;
      }

      // Validasi respons terhadap AiResponseSchema sebelum dikembalikan
      return validateAiResponse(responseData);
    } catch (err) {
      // Re-throw AiGatewayError yang sudah dibuat oleh validateAiResponse
      if (err instanceof AiGatewayError) throw err;

      if (axios.isAxiosError(err)) {
        // Timeout — axios melempar ECONNABORTED saat melewati batas waktu
        if (err.code === "ECONNABORTED" || err.code === "ERR_CANCELED") {
          throw new AiGatewayError(
            "timeout",
            `Layanan AI tidak merespons dalam ${config.AI_TIMEOUT_MS}ms`,
          );
        }

        // Error 5xx dari layanan AI
        if ((err.response?.status ?? 0) >= 500) {
          throw new AiGatewayError(
            "upstream_error",
            `Layanan AI mengembalikan error ${err.response?.status ?? "unknown"}`,
          );
        }

        // Error 4xx — kemungkinan payload yang dikirim tidak valid
        if ((err.response?.status ?? 0) >= 400) {
          throw new AiGatewayError(
            "upstream_error",
            `Layanan AI menolak request: ${err.response?.status ?? "unknown"}`,
          );
        }
      }

      // Error tak terduga lainnya
      throw new AiGatewayError(
        "upstream_error",
        "Kegagalan tak terduga saat menghubungi layanan AI",
      );
    }
  }
}
