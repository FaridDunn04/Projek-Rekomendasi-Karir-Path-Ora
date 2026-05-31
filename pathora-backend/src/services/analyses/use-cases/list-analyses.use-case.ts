/**
 * services/analyses/use-cases/list-analyses.use-case.ts
 *
 * Use-case daftar riwayat analisis milik user (FR-023, API-012, SDD §3.7.4).
 * Mengembalikan summary saja — tanpa result JSONB penuh (NFR-011).
 */

import type { AnalysisSummary } from "../repositories/analyses.repository";
import type {
  PaginationParams,
  PaginationMeta,
} from "../../../utils/pagination";

// ── Dependencies ───────────────────────────────────────────────────────────────

interface AnalysesRepo {
  findByUser(
    userId: string,
    pagination: PaginationParams,
  ): Promise<AnalysisSummary[]>;
}

interface ListAnalysesDeps {
  analysesRepo: AnalysesRepo;
}

// ── Output ─────────────────────────────────────────────────────────────────────

export interface ListAnalysesResult {
  analyses: AnalysisSummary[];
  meta: PaginationMeta;
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createListAnalysesUseCase({ analysesRepo }: ListAnalysesDeps) {
  return {
    /**
     * Mengambil riwayat analisis milik user dengan paginasi.
     */
    async execute(
      userId: string,
      pagination: PaginationParams,
    ): Promise<ListAnalysesResult> {
      const analyses = await analysesRepo.findByUser(userId, pagination);
      return {
        analyses,
        meta: { limit: pagination.limit, offset: pagination.offset },
      };
    },
  };
}
