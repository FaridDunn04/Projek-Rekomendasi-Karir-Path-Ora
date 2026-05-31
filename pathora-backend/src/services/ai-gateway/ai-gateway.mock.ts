/**
 * services/ai-gateway/ai-gateway.mock.ts
 *
 * Mock AI Gateway — mengembalikan payload hardcoded sesuai API Contract
 * untuk pengembangan paralel tanpa layanan AI nyata (FR-015, BTS-03, SDD §3.6).
 *
 * Payload mock:
 *  - Lolos AiResponseSchema (divalidasi saat startup via validateAiResponse)
 *  - Mencakup 5 prediksi dengan confidence beragam (termasuk < 0.05 untuk test filter)
 *  - Mencakup career_recommendations dengan match_score beragam (termasuk < 0.3)
 *  - Diselaraskan dengan docs/contract-api-Ai.json (NFR-020)
 *
 * Simulasi latensi 200ms agar alur loading state frontend dapat diuji.
 */

import { validateAiResponse } from "../../utils/ai-schema-validator.js";
import type { AiGatewayAdapter, CvSource } from "./ai-gateway.adapter.js";
import type { AiAnalysisResult } from "./ai-response.schema.js";

// ── Helper ─────────────────────────────────────────────────────────────────────

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// ── Payload Mock ───────────────────────────────────────────────────────────────
// Selaras dengan docs/contract-api-Ai.json

const MOCK_PAYLOAD = {
  cv_id: "mock-cv-id",
  analyzed_at: new Date().toISOString(),
  predicted_category: "INFORMATION-TECHNOLOGY",
  confidence: 0.832,

  // 5 prediksi — item ke-3, 4, 5 di bawah threshold 0.05 (untuk test filter FR-016)
  top_5_predictions: [
    { category: "INFORMATION-TECHNOLOGY", confidence: 0.832 },
    { category: "ENGINEERING", confidence: 0.075 },
    { category: "DIGITAL-MEDIA", confidence: 0.031 },
    { category: "BUSINESS-DEVELOPMENT", confidence: 0.022 },
    { category: "FINANCE", confidence: 0.018 },
  ],

  // Skill gap per kategori — matched_skills diurutkan desc by similarity
  extracted_skills: [
    {
      category: "INFORMATION-TECHNOLOGY",
      matched_skills: [
        { skill: "Python", similarity: 0.92 },
        { skill: "TensorFlow", similarity: 0.89 },
        { skill: "PyTorch", similarity: 0.87 },
      ],
      missing_skills: [
        "Project Management",
        "Salesforce",
        "Financial Analysis",
      ],
    },
    {
      category: "ENGINEERING",
      matched_skills: [
        { skill: "Machine Learning", similarity: 0.85 },
        { skill: "Data Science", similarity: 0.8 },
      ],
      missing_skills: [
        "Civil Engineering",
        "Mechanical Design",
        "Electrical Systems",
      ],
    },
    {
      category: "DIGITAL-MEDIA",
      matched_skills: [
        { skill: "Data Visualization", similarity: 0.78 },
        { skill: "Big Data Analytics", similarity: 0.75 },
      ],
      missing_skills: ["Graphic Design", "Video Editing", "Content Writing"],
    },
    {
      category: "BUSINESS-DEVELOPMENT",
      matched_skills: [
        { skill: "Market Analysis", similarity: 0.65 },
        { skill: "Sales Strategy", similarity: 0.6 },
      ],
      missing_skills: [
        "Negotiation",
        "Customer Relationship Management",
        "Business Planning",
      ],
    },
    {
      category: "FINANCE",
      matched_skills: [
        { skill: "Financial Modeling", similarity: 0.55 },
        { skill: "Investment Analysis", similarity: 0.5 },
      ],
      missing_skills: ["Accounting", "Risk Management", "Financial Reporting"],
    },
  ],

  // Rekomendasi karir — item ke-2 dan ke-3 di bawah threshold 0.3 (untuk test filter FR-020)
  career_recommendations: [
    { category: "INFORMATION-TECHNOLOGY", match_score: 0.832 },
    { category: "ENGINEERING", match_score: 0.075 },
    { category: "DIGITAL-MEDIA", match_score: 0.031 },
  ],

  description_career_recommendations:
    "Based on the predicted category and extracted skills, the most suitable career paths " +
    "include roles such as Machine Learning Engineer, Data Scientist, and AI Researcher. " +
    "These roles leverage the strong skills in Python, TensorFlow, and PyTorch, which are " +
    "highly relevant in the Information Technology sector. Additionally, there are opportunities " +
    "in Engineering and Digital Media for roles that involve Machine Learning and Data " +
    "Visualization, respectively.",
};

// ── Mock Adapter ───────────────────────────────────────────────────────────────

export class MockAiGateway implements AiGatewayAdapter {
  /**
   * Mengembalikan payload mock yang sudah divalidasi.
   * CvSource diterima tapi diabaikan — mock selalu mengembalikan data yang sama.
   * cv_id di-override dengan cvId yang diterima agar korelasi tetap benar.
   */
  async analyze(_source: CvSource, cvId: string): Promise<AiAnalysisResult> {
    // Simulasi latensi jaringan
    await sleep(200);

    // Override cv_id dengan nilai aktual agar konsisten dengan record di DB
    const payload = { ...MOCK_PAYLOAD, cv_id: cvId };

    // Validasi payload mock terhadap schema — memastikan mock selalu sesuai kontrak
    return validateAiResponse(payload);
  }
}
