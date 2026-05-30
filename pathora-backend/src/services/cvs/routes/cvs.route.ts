/**
 * services/cvs/routes/cvs.route.ts
 *
 * Routing untuk domain CVs + Analyses (API-006..API-013, SDD §3.7.3, §3.7.4).
 * Dependency wiring: repo → use-cases → controller → routes.
 *
 * Routes:
 *   POST   /cvs                    → upload CV (teks atau berkas)
 *   GET    /cvs                    → daftar CV user
 *   GET    /cvs/:cvId              → detail CV
 *   DELETE /cvs/:cvId              → hapus CV
 *   POST   /cvs/:cvId/analyze      → trigger analisis AI
 *   GET    /cvs/:cvId/analysis     → analisis terbaru dari CV
 */

import { Router } from "express";
import { auth } from "@/middlewares/auth.js";
import { validate } from "@/middlewares/validate.js";
import { strictLimiter } from "@/middlewares/rate-limit.js";
import { uploadCvFile } from "@/middlewares/upload.js";
import { cvsRepository } from "@/services/cvs/repositories/cvs.repository.js";
import { analysesRepository } from "@/services/analyses/repositories/analyses.repository.js";
import { CvIdParamSchema } from "@/services/cvs/validators/cvs.schema.js";
import { UploadCvTextSchema } from "@/services/cvs/validators/cvs.schema.js";
import { createUploadCvTextUseCase } from "@/services/cvs/use-cases/upload-cv-text.use-case.js";
import { createUploadCvFileUseCase } from "@/services/cvs/use-cases/upload-cv-file.use-case.js";
import { createDeleteCvUseCase } from "@/services/cvs/use-cases/delete-cv.use-case.js";
import { createListCvsUseCase } from "@/services/cvs/use-cases/list-cvs.use-case.js";
import { createGetCvUseCase } from "@/services/cvs/use-cases/get-cv.use-case.js";
import { CvsController } from "@/services/cvs/controllers/cvs.controller.js";
import { createTriggerAnalysisUseCase } from "@/services/analyses/use-cases/trigger-analysis.use-case.js";
import { createGetLatestByCvUseCase } from "@/services/analyses/use-cases/get-latest-by-cv.use-case.js";
import { AnalysesController } from "@/services/analyses/controllers/analyses.controller.js";
import { createGetAnalysisUseCase } from "@/services/analyses/use-cases/get-analysis.use-case.js";
import { createListAnalysesUseCase } from "@/services/analyses/use-cases/list-analyses.use-case.js";
import { createAiGateway } from "@/services/ai-gateway/ai-gateway.factory.js";

// ── Dependency Wiring ──────────────────────────────────────────────────────────

const aiGateway = createAiGateway();

// CVs use-cases
const uploadCvTextUseCase = createUploadCvTextUseCase({
  cvsRepo: cvsRepository,
});
const uploadCvFileUseCase = createUploadCvFileUseCase({
  cvsRepo: cvsRepository,
});
const deleteCvUseCase = createDeleteCvUseCase({ cvsRepo: cvsRepository });
const listCvsUseCase = createListCvsUseCase({ cvsRepo: cvsRepository });
const getCvUseCase = createGetCvUseCase({ cvsRepo: cvsRepository });

// Analyses use-cases
const triggerAnalysisUseCase = createTriggerAnalysisUseCase({
  cvsRepo: cvsRepository,
  analysesRepo: analysesRepository,
  aiGateway,
});
const getLatestByCvUseCase = createGetLatestByCvUseCase({
  cvsRepo: cvsRepository,
  analysesRepo: analysesRepository,
});
const getAnalysisUseCase = createGetAnalysisUseCase({
  analysesRepo: analysesRepository,
});
const listAnalysesUseCase = createListAnalysesUseCase({
  analysesRepo: analysesRepository,
});

// Controllers
const cvsController = new CvsController({
  uploadCvTextUseCase,
  uploadCvFileUseCase,
  deleteCvUseCase,
  listCvsUseCase,
  getCvUseCase,
});

const analysesController = new AnalysesController({
  triggerAnalysisUseCase,
  getAnalysisUseCase,
  getLatestByCvUseCase,
  listAnalysesUseCase,
});

// ── Router ─────────────────────────────────────────────────────────────────────

const router = Router();

// CV endpoints
router.post(
  "/",
  auth,
  uploadCvFile, // Multer: validasi MIME & ukuran
  cvsController.upload,
);

router.get("/", auth, cvsController.list);

router.get(
  "/:cvId",
  auth,
  validate(CvIdParamSchema, "params"),
  cvsController.getOne,
);

router.delete(
  "/:cvId",
  auth,
  validate(CvIdParamSchema, "params"),
  cvsController.remove,
);

// Analyses endpoints (nested under /cvs/:cvId)
router.post(
  "/:cvId/analyze",
  auth,
  strictLimiter,
  validate(CvIdParamSchema, "params"),
  analysesController.trigger,
);

router.get(
  "/:cvId/analysis",
  auth,
  validate(CvIdParamSchema, "params"),
  analysesController.getLatestByCv,
);

export default router;
