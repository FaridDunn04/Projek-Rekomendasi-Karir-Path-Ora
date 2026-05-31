/**
 * services/categories/routes/categories.route.ts
 *
 * Routing untuk referensi kategori karir (API-014, SDD §3.7.6).
 * Endpoint ini TIDAK memerlukan autentikasi — guest boleh akses (ACT-01).
 */

import { Router } from "express";
import { categoriesRepository } from "../repositories/categories.repository";
import { createCategoriesController } from "../controllers/categories.controller";

// ── Dependency Wiring ──────────────────────────────────────────────────────────

const { getAll } = createCategoriesController({
  categoriesRepo: categoriesRepository,
});

// ── Router ─────────────────────────────────────────────────────────────────────

const router = Router();

/** GET /categories */
router.get("/", getAll);

export default router;
