/**
 * services/cvs/use-cases/upload-cv-text.use-case.ts
 *
 * Use-case upload CV via teks (FR-008, VAL-003, SDD §3.7.3).
 */

import { ClientError } from "../../../exceptions/client-error";
import type { Cv, CreateCvTextDto } from "../repositories/cvs.repository";

// ── Dependencies ───────────────────────────────────────────────────────────────

interface CvsRepo {
  create(data: CreateCvTextDto): Promise<Cv>;
}

interface UploadCvTextDeps {
  cvsRepo: CvsRepo;
}

// ── Input ──────────────────────────────────────────────────────────────────────

export interface UploadCvTextInput {
  userId: string;
  raw_text: string;
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createUploadCvTextUseCase({ cvsRepo }: UploadCvTextDeps) {
  return {
    /**
     * Menyimpan CV teks ke database.
     * Validasi panjang minimal 100 karakter (VAL-003).
     */
    async execute({ userId, raw_text }: UploadCvTextInput): Promise<Cv> {
      if (raw_text.trim().length < 100) {
        throw new ClientError("Teks CV minimal 100 karakter");
      }

      return cvsRepo.create({
        user_id: userId,
        source_type: "text",
        raw_text,
      });
    },
  };
}
