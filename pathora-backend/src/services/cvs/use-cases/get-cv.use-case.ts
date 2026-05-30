/**
 * services/cvs/use-cases/get-cv.use-case.ts
 *
 * Use-case ambil detail satu CV (FR-012, SEC-003, SDD §3.7.3).
 * Ownership check: hanya pemilik CV yang boleh mengakses.
 * Mengembalikan CvFull (termasuk file_data) untuk keperluan internal.
 * Controller akan menyaring field sensitif sebelum dikirim ke klien.
 */

import { NotFoundError } from "@/exceptions/not-found-error.js";
import { AuthorizationError } from "@/exceptions/authorization-error.js";
import type { CvFull } from "@/services/cvs/repositories/cvs.repository.js";

// ── Dependencies ───────────────────────────────────────────────────────────────

interface CvsRepo {
  findById(id: string): Promise<CvFull | null>;
}

interface GetCvDeps {
  cvsRepo: CvsRepo;
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createGetCvUseCase({ cvsRepo }: GetCvDeps) {
  return {
    /**
     * Mengambil detail CV.
     * file_data tidak dikembalikan ke klien — controller hanya mengekspos
     * kolom yang aman (id, user_id, source_type, created_at).
     */
    async execute(
      cvId: string,
      userId: string,
    ): Promise<Omit<CvFull, "file_data" | "raw_text">> {
      const cv = await cvsRepo.findById(cvId);

      if (!cv) {
        throw new NotFoundError("CV tidak ditemukan");
      }

      if (cv.user_id !== userId) {
        throw new AuthorizationError("Anda tidak memiliki akses ke CV ini");
      }

      // Jangan kembalikan file_data/raw_text ke klien
      const { file_data: _fd, raw_text: _rt, ...safe } = cv;
      return safe;
    },
  };
}
