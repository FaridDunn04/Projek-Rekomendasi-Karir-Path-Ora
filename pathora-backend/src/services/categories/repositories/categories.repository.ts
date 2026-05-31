/**
 * services/categories/repositories/categories.repository.ts
 *
 * Query untuk tabel categories (FR-024, DATA-004, SDD §3.7.6).
 *
 * Data kategori bersifat statis — cache in-memory dikelola di controller
 * agar query DB hanya terjadi sekali selama server hidup (§11.2).
 */

import { query } from "../../../config/database.js";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Category {
  code: string;
  display_name: string;
  description: string | null;
}

// ── Repository ─────────────────────────────────────────────────────────────────

export const categoriesRepository = {
  /**
   * Mengambil seluruh kategori karir, diurutkan berdasarkan code.
   */
  async findAll(): Promise<Category[]> {
    const result = await query<Category>(
      `SELECT code, display_name, description
       FROM   categories
       ORDER  BY code`,
    );
    return result.rows;
  },
};
