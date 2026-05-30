/**
 * services/analyses/routes/analyses.route.ts
 *
 * Routing untuk endpoint /analyses (API-012, API-013, SDD §3.7.4).
 * Dependency wiring: repo → use-cases → controller → routes.
 *
 * Routes:
 *   GET /analyses              → riwayat analisis user
 *   GET /analyses/:analysisId  → detail analisis (dengan filtering)
 */

import { Router } from "express";
import { auth } from "@/middlewares/auth.js";
import { validate } from "@/middlewares/validate.js";
import { analysesRepository } from "@/services/analyses/repositories/analyses.repository.js";
import { cvsRepository } from "@/services/cvs/repositories/cvs.repository.js";
import { AnalysisIdParamSchema } from "@/services/analyses/validators/analyses.schema.js";
import { createGetAnalysisUseCase } from "@/services/analyses/use-cases/get-analysis.use-case.js";
import { createListAnalysesUseCase } from "@/services/analyses/use-cases/list-analyses.use-case.js";
import { createGetLatestByCvUseCase } from "@/services/analyses/use-cases/get-latest-by-cv.use-case.js";
import { createTriggerAnalysisUseCase } from "@/services/analyses/use-cases/trigger-analysis.use-case.js";
import { createAiGateway } from "@/services/ai-gateway/ai-gateway.factory.js";
import { AnalysesController } from "@/services/analyses/controllers/analyses.controller.js";

// ── Dependency Wiring ──────────────────────────────────────────────────────────

const aiGateway = createAiGateway();

const getAnalysisUseCase = createGetAnalysisUseCase({
  analysesRepo: analysesRepository,
});
const listAnalysesUseCase = createListAnalysesUseCase({
  analysesRepo: analysesRepository,
});
const getLatestByCvUseCase = createGetLatestByCvUseCase({
  cvsRepo: cvsRepository,
  analysesRepo: analysesRepository,
});
const triggerAnalysisUseCase = createTriggerAnalysisUseCase({
  cvsRepo: cvsRepository,
  analysesRepo: analysesRepository,
  aiGateway,
});

const controller = new AnalysesController({
  triggerAnalysisUseCase,
  getAnalysisUseCase,
  getLatestByCvUseCase,
  listAnalysesUseCase,
});

// ── Router ─────────────────────────────────────────────────────────────────────

const router = Router();

/**
 * GET /analyses
 * Riwayat analisis milik user dengan paginasi.
 */
router.get("/", auth, controller.list);

/**
 * GET /analyses/:analysisId
 * Detail analisis dengan filtering tampilan (FR-016..FR-021).
 */
router.get(
  "/:analysisId",
  auth,
  validate(AnalysisIdParamSchema, "params"),
  controller.getOne,
);

export default router;
