/**
 * services/analyses/controllers/analyses.controller.ts
 *
 * Controller untuk domain Analyses (FR-013..FR-014, FR-023, SDD §3.7.4).
 * Identitas user selalu dari req.user (JWT), tidak dari body (SEC-003).
 */

import type { Request, Response, NextFunction } from "express";
import { response } from "../../../utils/response.js";
import { parsePagination } from "../../../utils/pagination.js";

// ── Dependency Interfaces ──────────────────────────────────────────────────────

interface TriggerAnalysisUseCase {
  execute(cvId: string, userId: string): Promise<unknown>;
}

interface GetAnalysisUseCase {
  execute(analysisId: string, userId: string): Promise<unknown>;
}

interface GetLatestByCvUseCase {
  execute(cvId: string, userId: string): Promise<unknown>;
}

interface ListAnalysesUseCase {
  execute(
    userId: string,
    pagination: { limit: number; offset: number },
  ): Promise<{ analyses: unknown[]; meta: unknown }>;
}

interface AnalysesControllerDeps {
  triggerAnalysisUseCase: TriggerAnalysisUseCase;
  getAnalysisUseCase: GetAnalysisUseCase;
  getLatestByCvUseCase: GetLatestByCvUseCase;
  listAnalysesUseCase: ListAnalysesUseCase;
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createAnalysesController({
  triggerAnalysisUseCase,
  getAnalysisUseCase,
  getLatestByCvUseCase,
  listAnalysesUseCase,
}: AnalysesControllerDeps) {
  /**
   * POST /cvs/:cvId/analyze
   * Memicu analisis CV via AI Gateway.
   */
  async function trigger(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { cvId } = req.params as { cvId: string };
      const result = await triggerAnalysisUseCase.execute(cvId, req.user!.id);
      res.status(200).json(response.success(result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /analyses/:analysisId
   * Detail analisis dengan filtering tampilan (FR-016..FR-021).
   */
  async function getOne(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { analysisId } = req.params as { analysisId: string };
      const analysis = await getAnalysisUseCase.execute(
        analysisId,
        req.user!.id,
      );
      res.status(200).json(response.success(analysis));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /cvs/:cvId/analysis
   * Analisis terbaru dari sebuah CV.
   */
  async function getLatestByCv(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { cvId } = req.params as { cvId: string };
      const analysis = await getLatestByCvUseCase.execute(cvId, req.user!.id);
      res.status(200).json(response.success(analysis));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /analyses
   * Riwayat analisis milik user dengan paginasi.
   */
  async function list(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const pagination = parsePagination(req.query as Record<string, unknown>);
      const result = await listAnalysesUseCase.execute(userId, pagination);
      res
        .status(200)
        .json(
          response.success(
            result.analyses,
            result.meta as Record<string, unknown>,
          ),
        );
    } catch (err) {
      next(err);
    }
  }

  return { trigger, getOne, getLatestByCv, list };
}
