/**
 * services/dashboard/routes/dashboard.route.ts
 *
 * Routing untuk Dashboard Utama (API-005, SDD §3.7.5).
 */

import { Router } from "express";
import { auth } from "../../../middlewares/auth";
import { dashboardRepository } from "../repositories/dashboard.repository";
import { createGetDashboardUseCase } from "../use-cases/get-dashboard.use-case";
import { createDashboardController } from "../controllers/dashboard.controller";

// ── Dependency Wiring ──────────────────────────────────────────────────────────

const getDashboardUseCase = createGetDashboardUseCase({
  dashboardRepo: dashboardRepository,
});
const { getMyDashboard } = createDashboardController({ getDashboardUseCase });

// ── Router ─────────────────────────────────────────────────────────────────────

const router = Router();

/** GET /dashboard/me */
router.get("/me", auth, getMyDashboard);

export default router;
