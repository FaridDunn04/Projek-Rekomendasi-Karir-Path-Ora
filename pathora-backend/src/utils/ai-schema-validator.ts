/**
 * utils/ai-schema-validator.ts
 *
 * Validasi payload respons dari layanan AI menggunakan Zod schema
 * (VAL-007, NFR-018, NFR-020, SDD §3.5).
 *
 * Schema didefinisikan di `services/ai-gateway/ai-response.schema.ts`
 * sebagai single source of truth — file ini hanya mengekspor fungsi
 * validator yang melempar AiGatewayError bila parse gagal.
 *
 * Digunakan oleh:
 *  - HttpAiGateway  → validasi respons nyata dari layanan AI
 *  - MockAiGateway  → validasi payload mock (memastikan mock sesuai kontrak)
 */

import {
  AiResponseSchema,
  type AiAnalysisResult,
} from "../services/ai-gateway/ai-response.schema.js";
import { AiGatewayError } from "../exceptions/ai-gateway-error.js";
import { z } from "zod";

/**
 * Memvalidasi data mentah dari layanan AI terhadap AiResponseSchema.
 *
 * @param data - Payload mentah dari respons AI (unknown)
 * @returns    - AiAnalysisResult yang sudah divalidasi & di-type
 * @throws     - AiGatewayError('invalid_response') bila schema tidak cocok
 */
export function validateAiResponse(data: unknown): AiAnalysisResult {
  const parsed = AiResponseSchema.safeParse(data);

  if (!parsed.success) {
    throw new AiGatewayError(
      "invalid_response",
      "Respons AI tidak sesuai schema yang diharapkan",
      z.treeifyError(parsed.error),
    );
  }

  return parsed.data;
}
