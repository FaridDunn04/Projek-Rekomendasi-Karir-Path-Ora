/**
 * services/ai-gateway/ai-gateway.factory.ts
 *
 * Factory yang memilih implementasi AI Gateway berdasarkan env USE_MOCK_AI
 * (Factory Pattern, SDD §3.6, BTS-03).
 *
 * Dipanggil SEKALI saat startup di app.ts / server.ts.
 * Instance yang dihasilkan di-inject ke trigger-analysis.use-case
 * melalui Dependency Injection manual.
 *
 * USE_MOCK_AI=true  → MockAiGateway  (development tanpa layanan AI nyata)
 * USE_MOCK_AI=false → HttpAiGateway  (production / staging dengan AI nyata)
 */

import { config } from "../../config";
import { HttpAiGateway } from "./ai-gateway.http";
import { MockAiGateway } from "./ai-gateway.mock";
import type { AiGatewayAdapter } from "./ai-gateway.adapter";

/**
 * Membuat instance AI Gateway sesuai konfigurasi environment.
 *
 * @returns AiGatewayAdapter — HttpAiGateway atau MockAiGateway
 */
export function createAiGateway(): AiGatewayAdapter {
  if (config.USE_MOCK_AI) {
    return new MockAiGateway();
  }
  return new HttpAiGateway();
}
