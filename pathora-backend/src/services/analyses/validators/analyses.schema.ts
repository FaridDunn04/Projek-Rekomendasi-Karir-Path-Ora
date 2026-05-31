/**
 * services/analyses/validators/analyses.schema.ts
 *
 * Zod schemas untuk validasi parameter domain Analyses (VAL-006, SDD §3.7.4).
 */

import { z } from "zod";

// ── Analysis ID Param ──────────────────────────────────────────────────────────

/**
 * Validasi path parameter :analysisId — harus UUID valid (VAL-006).
 */
export const AnalysisIdParamSchema = z.object({
  analysisId: z.uuid("analysisId harus berupa UUID yang valid"),
});

export type AnalysisIdParam = z.infer<typeof AnalysisIdParamSchema>;
