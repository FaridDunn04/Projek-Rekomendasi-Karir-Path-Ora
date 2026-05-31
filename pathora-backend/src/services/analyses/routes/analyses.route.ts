/**
 * services/analyses/routes/analyses.route.ts
 *
 * Routing untuk endpoint /analyses (API-012, API-013, SDD §3.7.4).
 * Dependency wiring: repo → use-cases → controller → routes.
 */

import { Router } from "express";
import { auth } from "../../../middlewares/auth";
import { validate } from "../../../middlewares/validate";
import { analysesRepository } from "../repositories/analyses.repository";
import { cvsRepository } from "../../cvs/repositories/cvs.repository";
import { AnalysisIdParamSchema } from "../validators/analyses.schema";
import { createGetAnalysisUseCase } from "../use-cases/get-analysis.use-case";
import { createListAnalysesUseCase } from "../use-cases/list-analyses.use-case";
import { createGetLatestByCvUseCase } from "../use-cases/get-latest-by-cv.use-case";
import { createTriggerAnalysisUseCase } from "../use-cases/trigger-analysis.use-case";
import { createAiGateway } from "../../ai-gateway/ai-gateway.factory";
import { createAnalysesController } from "../controllers/analyses.controller";

// ── Dependency Wiring ──────────────────────────────────────────────────────────

const aiGateway = createAiGateway();

const { getOne, list } = createAnalysesController({
  triggerAnalysisUseCase: createTriggerAnalysisUseCase({
    cvsRepo: cvsRepository,
    analysesRepo: analysesRepository,
    aiGateway,
  }),
  getAnalysisUseCase: createGetAnalysisUseCase({
    analysesRepo: analysesRepository,
  }),
  getLatestByCvUseCase: createGetLatestByCvUseCase({
    cvsRepo: cvsRepository,
    analysesRepo: analysesRepository,
  }),
  listAnalysesUseCase: createListAnalysesUseCase({
    analysesRepo: analysesRepository,
  }),
});

// ── Router ─────────────────────────────────────────────────────────────────────

const router = Router();

/** GET /analyses */
router.get("/", auth, list);

/** GET /analyses/:analysisId */
router.get(
  "/:analysisId",
  auth,
  validate(AnalysisIdParamSchema, "params"),
  getOne,
);

export default router;
