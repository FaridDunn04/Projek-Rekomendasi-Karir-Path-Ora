/**
 * services/categories/routes/categories.route.ts
 *
 * Routing untuk referensi kategori karir (API-014, SDD §3.7.6).
 *
 * Endpoint ini TIDAK memerlukan autentikasi — guest boleh akses (ACT-01).
 *
 * Routes:
 *   GET /categories → seluruh kategori karir (dengan cache in-memory)
 */

import { Router } from "express";
import { categoriesRepository } from "@/services/categories/repositories/categories.repository.js";
import { CategoriesController } from "@/services/categories/controllers/categories.controller.js";

// ── Dependency Wiring ──────────────────────────────────────────────────────────

const controller = new CategoriesController({
  categoriesRepo: categoriesRepository,
});

// ── Router ─────────────────────────────────────────────────────────────────────

const router = Router();

/**
 * GET /categories
 * Mengembalikan seluruh kategori karir.
 * Cache in-memory dikelola di controller (§11.2).
 */
router.get("/", controller.getAll);

export default router;
