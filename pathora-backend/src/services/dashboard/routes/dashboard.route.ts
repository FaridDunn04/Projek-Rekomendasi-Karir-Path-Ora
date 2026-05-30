/**
 * services/dashboard/routes/dashboard.route.ts
 *
 * Routing untuk Dashboard Utama (API-005, SDD §3.7.5).
 *
 * Routes:
 *   GET /dashboard/me → data dashboard user yang sedang login
 */

import { Router } from "express";
import { auth } from "@/middlewares/auth.js";
import { dashboardRepository } from "@/services/dashboard/repositories/dashboard.repository.js";
import { createGetDashboardUseCase } from "@/services/dashboard/use-cases/get-dashboard.use-case.js";
import { DashboardController } from "@/services/dashboard/controllers/dashboard.controller.js";

// ── Dependency Wiring ──────────────────────────────────────────────────────────

const getDashboardUseCase = createGetDashboardUseCase({
  dashboardRepo: dashboardRepository,
});

const controller = new DashboardController({ getDashboardUseCase });

// ── Router ─────────────────────────────────────────────────────────────────────

const router = Router();

/**
 * GET /dashboard/me
 * Mengembalikan lastAnalysis + recentHistory untuk Dashboard Utama.
 */
router.get("/me", auth, controller.getMyDashboard);

export default router;
