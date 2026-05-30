/**
 * services/analyses/controllers/analyses.controller.ts
 *
 * Controller untuk domain Analyses (FR-013..FR-014, FR-023, SDD §3.7.4).
 * Identitas user selalu dari req.user (JWT), tidak dari body (SEC-003).
 */

import type { Request, Response, NextFunction } from "express";
import { response } from "@/utils/response.js";
import { parsePagination } from "@/utils/pagination.js";

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

// ── Controller ─────────────────────────────────────────────────────────────────

export class AnalysesController {
  private readonly triggerAnalysisUseCase: TriggerAnalysisUseCase;
  private readonly getAnalysisUseCase: GetAnalysisUseCase;
  private readonly getLatestByCvUseCase: GetLatestByCvUseCase;
  private readonly listAnalysesUseCase: ListAnalysesUseCase;

  constructor(deps: AnalysesControllerDeps) {
    this.triggerAnalysisUseCase = deps.triggerAnalysisUseCase;
    this.getAnalysisUseCase = deps.getAnalysisUseCase;
    this.getLatestByCvUseCase = deps.getLatestByCvUseCase;
    this.listAnalysesUseCase = deps.listAnalysesUseCase;

    this.trigger = this.trigger.bind(this);
    this.getOne = this.getOne.bind(this);
    this.getLatestByCv = this.getLatestByCv.bind(this);
    this.list = this.list.bind(this);
  }

  /**
   * POST /cvs/:cvId/analyze
   * Memicu analisis CV via AI Gateway.
   */
  async trigger(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { cvId } = req.params as { cvId: string };
      const result = await this.triggerAnalysisUseCase.execute(
        cvId,
        req.user!.id,
      );
      res.status(200).json(response.success(result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /analyses/:analysisId
   * Detail analisis dengan filtering tampilan (FR-016..FR-021).
   */
  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { analysisId } = req.params as { analysisId: string };
      const analysis = await this.getAnalysisUseCase.execute(
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
  async getLatestByCv(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { cvId } = req.params as { cvId: string };
      const analysis = await this.getLatestByCvUseCase.execute(
        cvId,
        req.user!.id,
      );
      res.status(200).json(response.success(analysis));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /analyses
   * Riwayat analisis milik user dengan paginasi.
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const pagination = parsePagination(req.query as Record<string, unknown>);
      const result = await this.listAnalysesUseCase.execute(userId, pagination);
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
}
