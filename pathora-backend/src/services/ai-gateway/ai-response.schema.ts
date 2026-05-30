/**
 * services/ai-gateway/ai-response.schema.ts
 *
 * Zod schema yang merepresentasikan API Contract antara backend dan layanan AI
 * (VAL-007, DATA-005, NFR-018, NFR-020, SDD §3.5, §3.6).
 *
 * Ini adalah SINGLE SOURCE OF TRUTH untuk struktur respons AI.
 * Digunakan oleh:
 *  - utils/ai-schema-validator.ts  → validasi respons nyata & mock
 *  - ai-gateway.http.ts            → validasi sebelum menyimpan ke DB
 *  - ai-gateway.mock.ts            → memastikan payload mock sesuai kontrak
 *
 * Selaras dengan docs/contract-api-Ai.json.
 */

import { z } from "zod";

// ── Sub-schemas ────────────────────────────────────────────────────────────────

const PredictionSchema = z.object({
  category: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

const MatchedSkillSchema = z.object({
  skill: z.string().min(1),
  similarity: z.number().min(0).max(1),
});

const ExtractedSkillSchema = z.object({
  category: z.string().min(1),
  matched_skills: z.array(MatchedSkillSchema),
  missing_skills: z.array(z.string()),
});

const CareerRecommendationSchema = z.object({
  category: z.string().min(1),
  match_score: z.number().min(0).max(1),
});

// ── Root Schema ────────────────────────────────────────────────────────────────

export const AiResponseSchema = z.object({
  /** UUID CV yang dianalisis — dikirim backend ke AI, dikembalikan untuk korelasi */
  cv_id: z.string().min(1),

  /** Timestamp analisis dalam format ISO 8601 */
  analyzed_at: z.string().min(1),

  /** Kategori karir dengan probabilitas tertinggi */
  predicted_category: z.string().min(1),

  /** Confidence score kategori teratas (0–1) */
  confidence: z.number().min(0).max(1),

  /**
   * 5 prediksi kategori teratas beserta confidence-nya.
   * Frontend menampilkan hanya item dengan confidence > 0.05 (FR-016).
   */
  top_5_predictions: z.array(PredictionSchema).min(1).max(5),

  /**
   * Skill gap analysis per kategori:
   * - matched_skills: skill yang dimiliki kandidat (diurutkan desc by similarity)
   * - missing_skills: skill yang perlu ditambahkan
   */
  extracted_skills: z.array(ExtractedSkillSchema),

  /**
   * Rekomendasi karir berdasarkan match score.
   * Frontend menampilkan hanya item dengan match_score > 0.3 (FR-020).
   */
  career_recommendations: z.array(CareerRecommendationSchema),

  /**
   * Narasi rekomendasi karir dari AI.
   * Nullable bila AI tidak menghasilkan deskripsi.
   */
  description_career_recommendations: z.string().nullable(),
});

// ── Exported Type ──────────────────────────────────────────────────────────────

export type AiAnalysisResult = z.infer<typeof AiResponseSchema>;
