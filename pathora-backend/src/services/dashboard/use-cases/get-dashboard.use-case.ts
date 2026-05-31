/**
 * services/dashboard/use-cases/get-dashboard.use-case.ts
 *
 * Use-case Dashboard Utama (FR-005, FR-006, FR-007, API-005, SDD §3.7.5).
 *
 * Menjalankan dua query secara paralel (Promise.all) untuk efisiensi:
 *  - lastAnalysis   : analisis terakhir yang sukses (null = empty state)
 *  - recentHistory  : 5 analisis terbaru
 *
 * Empty state (lastAnalysis === null) ditangani di sisi frontend.
 */

import type { AnalysisSummary } from "../repositories/dashboard.repository.js";

// ── Dependencies ───────────────────────────────────────────────────────────────

interface DashboardRepo {
  getLastAnalysis(userId: string): Promise<AnalysisSummary | null>;
  getRecentHistory(userId: string, limit: number): Promise<AnalysisSummary[]>;
}

interface GetDashboardDeps {
  dashboardRepo: DashboardRepo;
}

// ── Output ─────────────────────────────────────────────────────────────────────

export interface DashboardData {
  lastAnalysis: AnalysisSummary | null;
  recentHistory: AnalysisSummary[];
}

// ── Factory ────────────────────────────────────────────────────────────────────

const RECENT_HISTORY_LIMIT = 5;

export function createGetDashboardUseCase({ dashboardRepo }: GetDashboardDeps) {
  return {
    /**
     * Mengambil data Dashboard Utama secara paralel.
     * lastAnalysis === null berarti user belum pernah melakukan analisis (FR-005).
     */
    async execute(userId: string): Promise<DashboardData> {
      const [lastAnalysis, recentHistory] = await Promise.all([
        dashboardRepo.getLastAnalysis(userId),
        dashboardRepo.getRecentHistory(userId, RECENT_HISTORY_LIMIT),
      ]);

      return { lastAnalysis, recentHistory };
    },
  };
}
