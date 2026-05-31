/**
 * services/analyses/use-cases/get-analysis.use-case.ts
 *
 * Use-case ambil detail analisis + terapkan aturan filtering (FR-016..FR-021, VAL-008, SDD §3.7.4, §5.4).
 *
 * Aturan filtering diterapkan di use-case layer (bukan SQL) karena data ada di JSONB:
 *  - top_5_predictions  : filter confidence > 0.05, sort desc (FR-016)
 *  - career_recommendations: filter match_score > 0.3, sort desc (FR-020)
 *  - matched_skills per kategori: sort desc by similarity (FR-017, FR-021)
 */

import { NotFoundError } from "../../../exceptions/not-found-error";
import { AuthorizationError } from "../../../exceptions/authorization-error";
import type { Analysis } from "../repositories/analyses.repository";
import type { AiAnalysisResult } from "../../ai-gateway/ai-response.schema";

// ── Dependencies ───────────────────────────────────────────────────────────────

interface AnalysesRepo {
  findById(id: string): Promise<Analysis | null>;
}

interface GetAnalysisDeps {
  analysesRepo: AnalysesRepo;
}

// ── Filtering Helpers ──────────────────────────────────────────────────────────

const CONFIDENCE_THRESHOLD = 0.05;
const MATCH_SCORE_THRESHOLD = 0.3;

function applyFilters(result: AiAnalysisResult): AiAnalysisResult {
  return {
    ...result,

    // Filter confidence > 0.05, sort desc (FR-016)
    top_5_predictions: result.top_5_predictions
      .filter((p) => p.confidence > CONFIDENCE_THRESHOLD)
      .sort((a, b) => b.confidence - a.confidence),

    // Sort matched_skills desc by similarity per kategori (FR-017, FR-021)
    extracted_skills: result.extracted_skills.map((skill) => ({
      ...skill,
      matched_skills: [...skill.matched_skills].sort(
        (a, b) => b.similarity - a.similarity,
      ),
    })),

    // Filter match_score > 0.3, sort desc (FR-020)
    career_recommendations: result.career_recommendations
      .filter((r) => r.match_score > MATCH_SCORE_THRESHOLD)
      .sort((a, b) => b.match_score - a.match_score),
  };
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createGetAnalysisUseCase({ analysesRepo }: GetAnalysisDeps) {
  return {
    /**
     * Mengambil detail analisis dengan aturan filtering tampilan.
     * Melempar NotFoundError bila tidak ada.
     * Melempar AuthorizationError bila bukan milik user (SEC-003).
     */
    async execute(analysisId: string, userId: string): Promise<Analysis> {
      const analysis = await analysesRepo.findById(analysisId);

      if (!analysis) {
        throw new NotFoundError("Analisis tidak ditemukan");
      }

      if (analysis.user_id !== userId) {
        throw new AuthorizationError(
          "Anda tidak memiliki akses ke analisis ini",
        );
      }

      // Terapkan filtering hanya bila result tersedia (status='success')
      if (analysis.result) {
        return { ...analysis, result: applyFilters(analysis.result) };
      }

      return analysis;
    },
  };
}
