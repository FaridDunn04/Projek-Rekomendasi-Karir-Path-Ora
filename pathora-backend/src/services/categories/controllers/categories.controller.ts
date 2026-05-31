/**
 * services/categories/controllers/categories.controller.ts
 *
 * Controller untuk endpoint /categories (FR-024, SDD §3.7.6).
 *
 * Cache in-memory (§11.2):
 *  - Pemanggilan pertama → query DB → simpan ke variabel modul
 *  - Pemanggilan berikutnya → langsung kembalikan cache
 *  - TTL: permanen hingga server restart (data kategori bersifat statis)
 *
 * Endpoint ini TIDAK memerlukan autentikasi (guest boleh akses, ACT-01).
 */

import type { Request, Response, NextFunction } from "express";
import { response } from "../../../utils/response.js";
import type { Category } from "../repositories/categories.repository.js";

// ── Dependency Interface ───────────────────────────────────────────────────────

interface CategoriesRepo {
  findAll(): Promise<Category[]>;
}

interface CategoriesControllerDeps {
  categoriesRepo: CategoriesRepo;
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createCategoriesController({
  categoriesRepo,
}: CategoriesControllerDeps) {
  // Cache in-memory — null berarti belum di-load (§11.2)
  let cache: Category[] | null = null;

  /**
   * GET /categories
   * Mengembalikan seluruh kategori karir (200).
   * Menggunakan cache in-memory — query DB hanya sekali per siklus hidup server.
   */
  async function getAll(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!cache) {
        cache = await categoriesRepo.findAll();
      }
      res.status(200).json(response.success(cache));
    } catch (err) {
      next(err);
    }
  }

  return { getAll };
}
