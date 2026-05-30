/**
 * services/health/health.route.ts
 *
 * Routing untuk health check (API-015, FR-025, SDD §3.7.7).
 *
 * Endpoint ini TIDAK memerlukan autentikasi.
 * Digunakan sebagai probe monitoring platform (NFR-010, NFR-022).
 *
 * Routes:
 *   GET /health → status layanan + koneksi database
 */

import { Router } from "express";
import { HealthController } from "@/services/health/health.controller.js";

// ── Dependency Wiring ──────────────────────────────────────────────────────────

const controller = new HealthController();

// ── Router ─────────────────────────────────────────────────────────────────────

const router = Router();

/**
 * GET /health
 * Mengembalikan { status, db, timestamp }.
 * 200 = ok, 503 = degraded (DB tidak dapat dijangkau).
 */
router.get("/", controller.check);

export default router;
