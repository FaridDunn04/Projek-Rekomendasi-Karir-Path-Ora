/**
 * services/cvs/use-cases/delete-cv.use-case.ts
 *
 * Use-case hapus CV (FR-012, SEC-003, SDD §3.7.3).
 * Ownership check: hanya pemilik CV yang boleh menghapus.
 */

import { NotFoundError } from "../../../exceptions/not-found-error";
import { AuthorizationError } from "../../../exceptions/authorization-error";
import type { Cv } from "../repositories/cvs.repository";

// ── Dependencies ───────────────────────────────────────────────────────────────

interface CvsRepo {
  findById(id: string): Promise<Cv | null>;
  delete(id: string): Promise<void>;
}

interface DeleteCvDeps {
  cvsRepo: CvsRepo;
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createDeleteCvUseCase({ cvsRepo }: DeleteCvDeps) {
  return {
    /**
     * Menghapus CV milik user.
     * Melempar NotFoundError bila CV tidak ada.
     * Melempar AuthorizationError bila CV bukan milik user (SEC-003).
     */
    async execute(cvId: string, userId: string): Promise<void> {
      const cv = await cvsRepo.findById(cvId);

      if (!cv) {
        throw new NotFoundError("CV tidak ditemukan");
      }

      if (cv.user_id !== userId) {
        throw new AuthorizationError("Anda tidak memiliki akses ke CV ini");
      }

      await cvsRepo.delete(cvId);
    },
  };
}
