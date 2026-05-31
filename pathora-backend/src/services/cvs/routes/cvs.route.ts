/**
 * services/cvs/routes/cvs.route.ts
 *
 * Routing untuk domain CVs + Analyses (API-006..API-013, SDD §3.7.3, §3.7.4).
 * Dependency wiring: repo → use-cases → controller → routes.
 */

import { Router } from "express";
import { auth } from "../../../middlewares/auth";
import { validate } from "../../../middlewares/validate";
import { strictLimiter } from "../../../middlewares/rate-limit";
import { uploadCvFile } from "../../../middlewares/upload";
import { cvsRepository } from "../repositories/cvs.repository";
import { analysesRepository } from "../../analyses/repositories/analyses.repository";
import {
  CvIdParamSchema,
} from "../validators/cvs.schema";
import { createUploadCvTextUseCase } from "../use-cases/upload-cv-text.use-case";
import { createUploadCvFileUseCase } from "../use-cases/upload-cv-file.use-case";
import { createDeleteCvUseCase } from "../use-cases/delete-cv.use-case";
import { createListCvsUseCase } from "../use-cases/list-cvs.use-case";
import { createGetCvUseCase } from "../use-cases/get-cv.use-case";
import { createCvsController } from "../controllers/cvs.controller";
import { createTriggerAnalysisUseCase } from "../../analyses/use-cases/trigger-analysis.use-case";
import { createGetLatestByCvUseCase } from "../../analyses/use-cases/get-latest-by-cv.use-case";
import { createGetAnalysisUseCase } from "../../analyses/use-cases/get-analysis.use-case";
import { createListAnalysesUseCase } from "../../analyses/use-cases/list-analyses.use-case";
import { createAnalysesController } from "../../analyses/controllers/analyses.controller";
import { createAiGateway } from "../../ai-gateway/ai-gateway.factory";

// ── Dependency Wiring ──────────────────────────────────────────────────────────

const aiGateway = createAiGateway();

// CVs
const { upload, list, getOne, remove } = createCvsController({
  uploadCvTextUseCase: createUploadCvTextUseCase({ cvsRepo: cvsRepository }),
  uploadCvFileUseCase: createUploadCvFileUseCase({ cvsRepo: cvsRepository }),
  deleteCvUseCase: createDeleteCvUseCase({ cvsRepo: cvsRepository }),
  listCvsUseCase: createListCvsUseCase({ cvsRepo: cvsRepository }),
  getCvUseCase: createGetCvUseCase({ cvsRepo: cvsRepository }),
});

// Analyses (nested under /cvs/:cvId)
const { trigger, getLatestByCv } = createAnalysesController({
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

router.post("/", auth, uploadCvFile, upload);
router.get("/", auth, list);
router.get("/:cvId", auth, validate(CvIdParamSchema, "params"), getOne);
router.delete("/:cvId", auth, validate(CvIdParamSchema, "params"), remove);

router.post(
  "/:cvId/analyze",
  auth,
  strictLimiter,
  validate(CvIdParamSchema, "params"),
  trigger,
);
router.get(
  "/:cvId/analysis",
  auth,
  validate(CvIdParamSchema, "params"),
  getLatestByCv,
);

export default router;
