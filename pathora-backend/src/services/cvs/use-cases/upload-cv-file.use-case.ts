/**
 * services/cvs/use-cases/upload-cv-file.use-case.ts
 *
 * Use-case upload CV via berkas (FR-009, VAL-004, SDD §3.7.3, revisi v1.1).
 *
 * Revisi v1.1: Backend TIDAK mengekstrak teks dari berkas.
 * Buffer mentah disimpan apa adanya ke kolom file_data (BYTEA).
 * Ekstraksi teks dilakukan oleh layanan AI saat analisis dipicu.
 * Validasi MIME & ukuran sudah ditangani oleh middlewares/upload.ts.
 */

import type { Cv, CreateCvFileDto } from "../repositories/cvs.repository";

// ── Dependencies ───────────────────────────────────────────────────────────────

interface CvsRepo {
  create(data: CreateCvFileDto): Promise<Cv>;
}

interface UploadCvFileDeps {
  cvsRepo: CvsRepo;
}

// ── Input ──────────────────────────────────────────────────────────────────────

export interface UploadCvFileInput {
  userId: string;
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createUploadCvFileUseCase({ cvsRepo }: UploadCvFileDeps) {
  return {
    /**
     * Menyimpan berkas CV mentah ke database.
     * Tidak ada ekstraksi teks — AI yang akan mengekstraknya saat analyze (revisi v1.1).
     */
    async execute({
      userId,
      buffer,
      mimeType,
      fileName,
    }: UploadCvFileInput): Promise<Cv> {
      return cvsRepo.create({
        user_id: userId,
        source_type: "file",
        file_name: fileName,
        file_mime: mimeType,
        file_data: buffer,
      });
    },
  };
}
