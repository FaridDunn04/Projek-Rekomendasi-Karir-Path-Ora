/**
 * services/cvs/repositories/cvs.repository.ts
 *
 * PostgreSQL repository untuk domain CVs (DATA-002, SDD §3.7.3, revisi v1.1).
 *
 * Revisi v1.1: tabel cvs memiliki kolom baru untuk berkas mentah:
 *   raw_text  — nullable, diisi untuk source_type='text'
 *   file_name — nullable, nama asli berkas
 *   file_mime — nullable, MIME type berkas
 *   file_data — nullable (BYTEA), konten berkas mentah diteruskan ke AI
 *
 * findByUser() TIDAK menyertakan file_data/raw_text agar query ringan (NFR-011).
 * findById()   MENYERTAKAN file_data agar dapat diteruskan ke AI saat analyze.
 */

import { query } from "@/config/database.js";
import type { PaginationParams } from "@/utils/pagination.js";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Cv {
  id: string;
  user_id: string;
  source_type: "text" | "file";
  created_at: Date;
}

/** CV lengkap termasuk konten — digunakan saat trigger analyze */
export interface CvFull extends Cv {
  raw_text: string | null;
  file_name: string | null;
  file_mime: string | null;
  file_data: Buffer | null;
}

export interface CreateCvTextDto {
  user_id: string;
  source_type: "text";
  raw_text: string;
}

export interface CreateCvFileDto {
  user_id: string;
  source_type: "file";
  file_name: string;
  file_mime: string;
  file_data: Buffer;
}

export type CreateCvDto = CreateCvTextDto | CreateCvFileDto;

// ── Repository ─────────────────────────────────────────────────────────────────

export const cvsRepository = {
  /**
   * Menyimpan CV baru ke database.
   * Kolom yang diisi bergantung pada source_type (revisi v1.1).
   */
  async create(data: CreateCvDto): Promise<Cv> {
    if (data.source_type === "text") {
      const result = await query<Cv>(
        `INSERT INTO cvs (user_id, source_type, raw_text)
         VALUES ($1, $2, $3)
         RETURNING id, user_id, source_type, created_at`,
        [data.user_id, data.source_type, data.raw_text],
      );
      return result.rows[0]!;
    } else {
      const result = await query<Cv>(
        `INSERT INTO cvs (user_id, source_type, file_name, file_mime, file_data)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, source_type, created_at`,
        [
          data.user_id,
          data.source_type,
          data.file_name,
          data.file_mime,
          data.file_data,
        ],
      );
      return result.rows[0]!;
    }
  },

  /**
   * Mencari CV berdasarkan ID — menyertakan file_data untuk diteruskan ke AI.
   * Mengembalikan null bila tidak ditemukan.
   */
  async findById(id: string): Promise<CvFull | null> {
    const result = await query<CvFull>(
      `SELECT id, user_id, source_type, raw_text, file_name, file_mime, file_data, created_at
       FROM cvs
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  },

  /**
   * Mengambil daftar CV milik user — TANPA file_data/raw_text agar ringan (NFR-011).
   * Diurutkan dari yang terbaru.
   */
  async findByUser(
    userId: string,
    pagination: PaginationParams,
  ): Promise<Cv[]> {
    const result = await query<Cv>(
      `SELECT id, user_id, source_type, created_at
       FROM cvs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, pagination.limit, pagination.offset],
    );
    return result.rows;
  },

  /**
   * Menghapus CV berdasarkan ID.
   * Cascade delete akan menghapus analyses terkait (DATA-006).
   */
  async delete(id: string): Promise<void> {
    await query(`DELETE FROM cvs WHERE id = $1`, [id]);
  },
};
