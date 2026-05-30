/**
 * services/cvs/validators/cvs.schema.ts
 *
 * Zod schemas untuk validasi input domain CVs (VAL-003, VAL-006, SDD §3.7.3).
 */

import { z } from "zod";

// ── Upload CV Teks ─────────────────────────────────────────────────────────────

/**
 * Validasi body untuk upload CV via teks (source_type='text').
 * raw_text minimal 100 karakter (VAL-003).
 */
export const UploadCvTextSchema = z.object({
  source_type: z.literal("text"),
  raw_text: z.string().min(100, "Teks CV minimal 100 karakter"),
});

export type UploadCvTextDto = z.infer<typeof UploadCvTextSchema>;

// ── CV ID Param ────────────────────────────────────────────────────────────────

/**
 * Validasi path parameter :cvId — harus UUID valid (VAL-006).
 */
export const CvIdParamSchema = z.object({
  cvId: z.string().uuid("cvId harus berupa UUID yang valid"),
});

export type CvIdParam = z.infer<typeof CvIdParamSchema>;
