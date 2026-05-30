/**
 * services/ai-gateway/ai-gateway.adapter.ts
 *
 * Kontrak (interface) AI Gateway — memisahkan abstraksi dari implementasi
 * (Adapter Pattern, SDD §3.6, FR-015, NFR-020, SEC-011).
 *
 * Use-case hanya bergantung pada interface ini, bukan pada implementasi
 * konkret (HttpAiGateway atau MockAiGateway). Penggantian implementasi
 * tidak mengubah satu baris pun di use-case.
 *
 * Revisi v1.1: analyze() menerima CvSource (teks ATAU berkas mentah).
 * Untuk berkas, layanan AI yang melakukan ekstraksi teks — backend hanya
 * meneruskan buffer apa adanya.
 */

import type { AiAnalysisResult } from "@/services/ai-gateway/ai-response.schema";

// ── CvSource ───────────────────────────────────────────────────────────────────

/**
 * Sumber CV yang dikirim ke layanan AI.
 *
 * - kind: 'text' → CV diinput sebagai teks mentah (rawText)
 * - kind: 'file' → CV diunggah sebagai berkas; AI yang mengekstrak teks
 */
export type CvSource =
  | { kind: "text"; rawText: string }
  | {
      kind: "file";
      fileData: Buffer;
      fileMime: string;
      fileName?: string;
    };

// ── Interface ──────────────────────────────────────────────────────────────────

export interface AiGatewayAdapter {
  /**
   * Mengirim CV ke layanan AI untuk dianalisis.
   *
   * @param source - Sumber CV: teks atau berkas mentah
   * @param cvId   - UUID CV (dikirim ke AI untuk korelasi respons)
   * @returns      - Hasil analisis yang sudah divalidasi terhadap AiResponseSchema
   * @throws       - AiGatewayError bila terjadi timeout, error upstream, atau respons invalid
   */
  analyze(source: CvSource, cvId: string): Promise<AiAnalysisResult>;
}
