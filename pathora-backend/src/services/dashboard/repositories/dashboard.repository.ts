/**
 * services/dashboard/repositories/dashboard.repository.ts
 *
 * Query khusus untuk Dashboard Utama (FR-005, FR-007, SDD §3.7.5).
 *
 * Dua query dijalankan paralel oleh use-case:
 *  - getLastAnalysis   : analisis terakhir yang sukses (untuk Card Ringkasan)
 *  - getRecentHistory  : N analisis terbaru (untuk Riwayat Upload)
 *
 * Kedua query hanya mengembalikan kolom summary — tanpa result JSONB (NFR-011).
 */

import { query } from "@/config/database.js";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AnalysisSummary {
  id: string;
  cv_id: string;
  user_id: string;
  status: string;
  predicted_category: string | null;
  confidence: number | null;
  analyzed_at: Date | null;
  created_at: Date;
}

// ── Repository ─────────────────────────────────────────────────────────────────

export const dashboardRepository = {
  /**
   * Mengambil analisis terakhir yang berhasil (status='success') milik user.
   * Digunakan untuk Card Ringkasan Analisis Terakhir (FR-005).
   * Mengembalikan null bila belum ada analisis sukses (empty state).
   */
  async getLastAnalysis(userId: string): Promise<AnalysisSummary | null> {
    const result = await query<AnalysisSummary>(
      `SELECT id, cv_id, user_id, status, predicted_category, confidence, analyzed_at, created_at
       FROM analyses
       WHERE user_id = $1
         AND status  = 'success'
       ORDER BY analyzed_at DESC
       LIMIT 1`,
      [userId],
    );
    return result.rows[0] ?? null;
  },

  /**
   * Mengambil N analisis terbaru milik user (semua status).
   * Digunakan untuk Riwayat Upload di Dashboard (FR-007).
   * JOIN dengan cvs untuk mendapatkan source_type.
   */
  async getRecentHistory(
    userId: string,
    limit: number,
  ): Promise<AnalysisSummary[]> {
    const result = await query<AnalysisSummary>(
      `SELECT a.id, a.cv_id, a.user_id, a.status,
              a.predicted_category, a.confidence, a.analyzed_at, a.created_at
       FROM   analyses a
       JOIN   cvs      c ON a.cv_id = c.id
       WHERE  a.user_id = $1
       ORDER  BY a.created_at DESC
       LIMIT  $2`,
      [userId, limit],
    );
    return result.rows;
  },
};
