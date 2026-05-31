/**
 * services/health/health.route.ts
 *
 * Routing untuk health check (API-015, FR-025, SDD §3.7.7).
 * Endpoint ini TIDAK memerlukan autentikasi.
 */

import { Router } from "express";
import { healthCheck } from "./health.controller.js";

const router = Router();

/** GET /health */
router.get("/", healthCheck);

export default router;
