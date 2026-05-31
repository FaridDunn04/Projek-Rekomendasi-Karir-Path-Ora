/**
 * services/analyses/routes/analyses.route.ts
 *
 * Routing untuk endpoint /analyses (API-012, API-013, SDD §3.7.4).
 * Dependency wiring: repo → use-cases → controller → routes.
 */

import { Router } from "express";
import { auth } from "../../../middlewares/auth.js";
import { validate } from "../../../middlewares/validate.js";
import { analysesRepository } from "../repositories/analyses.repository.js";
import { cvsRepository } from "../../cvs/repositories/cvs.repository.js";
import { AnalysisIdParamSchema } from "../validators/analyses.schema.js";
import { createGetAnalysisUseCase } from "../use-cases/get-analysis.use-case.js";
import { createListAnalysesUseCase } from "../use-cases/list-analyses.use-case.js";
import { createGetLatestByCvUseCase } from "../use-cases/get-latest-by-cv.use-case.js";
import { createTriggerAnalysisUseCase } from "../use-cases/trigger-analysis.use-case.js";
import { createAiGateway } from "../../ai-gateway/ai-gateway.factory.js";
import { createAnalysesController } from "../controllers/analyses.controller.js";

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
