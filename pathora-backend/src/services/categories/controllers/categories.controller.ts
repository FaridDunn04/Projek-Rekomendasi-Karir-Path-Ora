/**
 * services/categories/controllers/categories.controller.ts
 *
 * Controller untuk endpoint /categories (FR-024, SDD §3.7.6).
 *
 * Cache in-memory (§11.2):
 *  - Pemanggilan pertama → query DB → simpan ke variabel modul
 *  - Pemanggilan berikutnya → langsung kembalikan cache
 *  - TTL: permanen hingga server restart (data kategori bersifat statis)
 *  - Reset cache: restart proses
 *
 * Endpoint ini TIDAK memerlukan autentikasi (guest boleh akses, ACT-01).
 */

import type { Request, Response, NextFunction } from "express";
import { response } from "@/utils/response.js";
import type { Category } from "@/services/categories/repositories/categories.repository.js";

// ── Dependency Interface ───────────────────────────────────────────────────────

interface CategoriesRepo {
  findAll(): Promise<Category[]>;
}

interface CategoriesControllerDeps {
  categoriesRepo: CategoriesRepo;
}

// ── Controller ─────────────────────────────────────────────────────────────────

export class CategoriesController {
  private readonly categoriesRepo: CategoriesRepo;

  // Cache in-memory — null berarti belum di-load (§11.2)
  private cache: Category[] | null = null;

  constructor({ categoriesRepo }: CategoriesControllerDeps) {
    this.categoriesRepo = categoriesRepo;
    this.getAll = this.getAll.bind(this);
  }

  /**
   * GET /categories
   * Mengembalikan seluruh kategori karir (200).
   * Menggunakan cache in-memory — query DB hanya sekali per siklus hidup server.
   */
  async getAll(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!this.cache) {
        this.cache = await this.categoriesRepo.findAll();
      }
      res.status(200).json(response.success(this.cache));
    } catch (err) {
      next(err);
    }
  }
}
