/**
 * services/analyses/use-cases/trigger-analysis.use-case.ts
 *
 * Use-case paling kompleks — orkestrasi analisis CV via AI (FR-013, NFR-009, SDD §3.7.4).
 *
 * Alur:
 *  1. Validasi CV ada & milik user (ownership check, SEC-003)
 *  2. Buat record analyses dengan status 'pending' (§11.5)
 *  3. Bangun CvSource sesuai source_type (revisi v1.1)
 *  4. Panggil AI Gateway → validasi respons
 *  5. Update record ke 'success' + simpan result JSONB
 *  6. Catch: update ke 'failed' + log + re-throw (graceful degradation, NFR-009)
 */

import { logger } from "@/config/logger.js";
import { NotFoundError } from "@/exceptions/not-found-error.js";
import { AuthorizationError } from "@/exceptions/authorization-error.js";
import type { CvFull } from "@/services/cvs/repositories/cvs.repository.js";
import type { AnalysisSummary } from "@/services/analyses/repositories/analyses.repository.js";
import type { AiGatewayAdapter } from "@/services/ai-gateway/ai-gateway.adapter.js";
import type { AiAnalysisResult } from "@/services/ai-gateway/ai-response.schema.js";

// ── Dependencies ───────────────────────────────────────────────────────────────

interface CvsRepo {
  findById(id: string): Promise<CvFull | null>;
}

interface AnalysesRepo {
  create(data: {
    cv_id: string;
    user_id: string;
    status: "pending";
  }): Promise<AnalysisSummary>;
  update(
    id: string,
    data: {
      status: "success" | "failed";
      predicted_category?: string;
      confidence?: number;
      result?: AiAnalysisResult;
      analyzed_at?: Date;
    },
  ): Promise<AnalysisSummary>;
}

interface TriggerAnalysisDeps {
  cvsRepo: CvsRepo;
  analysesRepo: AnalysesRepo;
  aiGateway: AiGatewayAdapter;
}

// ── Output ─────────────────────────────────────────────────────────────────────

export interface TriggerAnalysisResult extends AiAnalysisResult {
  analysisId: string;
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createTriggerAnalysisUseCase({
  cvsRepo,
  analysesRepo,
  aiGateway,
}: TriggerAnalysisDeps) {
  return {
    /**
     * Memicu analisis CV via layanan AI.
     * Record 'pending' dibuat lebih dahulu agar kegagalan dapat dilacak.
     */
    async execute(
      cvId: string,
      userId: string,
    ): Promise<TriggerAnalysisResult> {
      // ── 1. Validasi CV & ownership ─────────────────────────────────────────
      const cv = await cvsRepo.findById(cvId);

      if (!cv) {
        throw new NotFoundError("CV tidak ditemukan");
      }

      if (cv.user_id !== userId) {
        throw new AuthorizationError("Anda tidak memiliki akses ke CV ini");
      }

      // ── 2. Buat record 'pending' ───────────────────────────────────────────
      const analysis = await analysesRepo.create({
        cv_id: cvId,
        user_id: userId,
        status: "pending",
      });
      const analysisId = analysis.id;

      try {
        // ── 3. Bangun CvSource sesuai source_type (revisi v1.1) ──────────────
        const source =
          cv.source_type === "text"
            ? { kind: "text" as const, rawText: cv.raw_text! }
            : {
                kind: "file" as const,
                fileData: cv.file_data!,
                fileMime: cv.file_mime!,
                fileName: cv.file_name ?? undefined,
              };

        // ── 4. Panggil AI Gateway ────────────────────────────────────────────
        const result = await aiGateway.analyze(source, cvId);

        // ── 5. Update ke 'success' ───────────────────────────────────────────
        await analysesRepo.update(analysisId, {
          status: "success",
          predicted_category: result.predicted_category,
          confidence: result.confidence,
          result,
          analyzed_at: new Date(),
        });

        return { analysisId, ...result };
      } catch (err) {
        // ── 6. Catch: tandai 'failed' + log + re-throw ───────────────────────
        await analysesRepo.update(analysisId, { status: "failed" });

        logger.error({ err, cvId, analysisId, userId }, "analysis.failed");

        throw err;
      }
    },
  };
}
