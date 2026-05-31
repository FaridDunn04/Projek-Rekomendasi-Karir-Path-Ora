/**
 * services/dashboard/controllers/dashboard.controller.ts
 *
 * Controller untuk Dashboard Utama (FR-005..FR-007, SDD §3.7.5).
 * Identitas user selalu dari req.user (JWT), tidak dari body (SEC-003).
 */

import type { Request, Response, NextFunction } from "express";
import { response } from "../../../utils/response.js";
import type { DashboardData } from "../use-cases/get-dashboard.use-case.js";

// ── Dependency Interface ───────────────────────────────────────────────────────

interface GetDashboardUseCase {
  execute(userId: string): Promise<DashboardData>;
}

interface DashboardControllerDeps {
  getDashboardUseCase: GetDashboardUseCase;
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createDashboardController({
  getDashboardUseCase,
}: DashboardControllerDeps) {
  /**
   * GET /dashboard/me
   * Mengembalikan data Dashboard Utama: lastAnalysis + recentHistory (200).
   * lastAnalysis === null → empty state, ditangani FE (FR-005).
   */
  async function getMyDashboard(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await getDashboardUseCase.execute(req.user!.id);
      res.status(200).json(response.success(data));
    } catch (err) {
      next(err);
    }
  }

  return { getMyDashboard };
}
