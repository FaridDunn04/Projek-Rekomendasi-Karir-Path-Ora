/**
 * services/cvs/use-cases/list-cvs.use-case.ts
 *
 * Use-case daftar CV milik user (FR-012, SDD §3.7.3).
 * Mengembalikan list ringkas tanpa file_data/raw_text (NFR-011).
 */

import type { Cv } from "../repositories/cvs.repository.js";
import type {
  PaginationParams,
  PaginationMeta,
} from "../../../utils/pagination.js";

// ── Dependencies ───────────────────────────────────────────────────────────────

interface CvsRepo {
  findByUser(userId: string, pagination: PaginationParams): Promise<Cv[]>;
}

interface ListCvsDeps {
  cvsRepo: CvsRepo;
}

// ── Output ─────────────────────────────────────────────────────────────────────

export interface ListCvsResult {
  cvs: Cv[];
  meta: PaginationMeta;
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createListCvsUseCase({ cvsRepo }: ListCvsDeps) {
  return {
    /**
     * Mengambil daftar CV milik user dengan paginasi.
     */
    async execute(
      userId: string,
      pagination: PaginationParams,
    ): Promise<ListCvsResult> {
      const cvs = await cvsRepo.findByUser(userId, pagination);
      return {
        cvs,
        meta: { limit: pagination.limit, offset: pagination.offset },
      };
    },
  };
}
