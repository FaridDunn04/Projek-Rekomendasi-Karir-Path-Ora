/**
 * middlewares/upload.ts
 *
 * Multer middleware untuk upload berkas CV (FR-009, VAL-004, SDD §3.3, revisi v1.1).
 *
 * Strategi memoryStorage: berkas disimpan sebagai Buffer di req.file.buffer
 * (tidak ditulis ke disk). Buffer ini kemudian disimpan oleh use-case ke kolom
 * cvs.file_data (BYTEA) dan diteruskan ke layanan AI saat analisis dipicu.
 *
 * PENTING (revisi v1.1): Backend TIDAK mengekstrak teks dari berkas.
 * Ekstraksi teks adalah tanggung jawab layanan AI. Backend hanya:
 *  1. Memvalidasi MIME type (PDF atau DOCX)
 *  2. Memvalidasi ukuran berkas (≤ MAX_FILE_SIZE_MB)
 *  3. Menyimpan buffer mentah
 *
 * MIME yang diizinkan:
 *  - application/pdf
 *  - application/vnd.openxmlformats-officedocument.wordprocessingml.document (DOCX)
 */

import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";
import { config } from "../config/index.js";
import { ClientError } from "../exceptions/client-error.js";

// ── MIME Types yang Diizinkan ──────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_MIME_LABEL = "PDF atau DOCX";

// ── File Filter ────────────────────────────────────────────────────────────────

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ClientError(
        `Tipe berkas tidak didukung. Hanya ${ALLOWED_MIME_LABEL} yang diizinkan`,
      ),
    );
  }
}

// ── Multer Instance ────────────────────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE_BYTES,
    files: 1,
  },
});

// ── Export ─────────────────────────────────────────────────────────────────────

/**
 * Middleware untuk upload satu berkas CV via field 'file'.
 *
 * Setelah middleware ini berjalan:
 *  - req.file.buffer   → konten berkas mentah (Buffer)
 *  - req.file.mimetype → MIME type berkas
 *  - req.file.originalname → nama asli berkas
 *
 * Bila tidak ada berkas (source_type='text'), req.file akan undefined —
 * controller mendeteksi ini dan menggunakan alur upload teks.
 */
export const uploadCvFile = upload.single("file");
