/**
 * services/auth/repositories/auth.repository.ts
 *
 * PostgreSQL repository untuk domain auth (DATA-001, SEC-001).
 * Seluruh query menggunakan parameterized queries ($1, $2, ...) — tidak ada
 * string concatenation (SEC-006).
 *
 * password_hash TIDAK pernah dikembalikan dari createUser (SEC-001).
 */

import { query } from "../../../config/database";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: Date;
}

export interface UserWithHash extends User {
  password_hash: string;
}

export interface CreateUserDto {
  email: string;
  full_name: string;
  password_hash: string;
}

// ── Repository ─────────────────────────────────────────────────────────────────

export const authRepository = {
  /**
   * Mencari user berdasarkan email, termasuk password_hash untuk verifikasi.
   * Mengembalikan null bila tidak ditemukan.
   */
  async findByEmail(email: string): Promise<UserWithHash | null> {
    const result = await query<UserWithHash>(
      `SELECT id, email, password_hash, full_name, created_at
       FROM users
       WHERE email = $1`,
      [email],
    );
    return result.rows[0] ?? null;
  },

  /**
   * Membuat user baru dan mengembalikan data tanpa password_hash (SEC-001).
   */
  async createUser(data: CreateUserDto): Promise<User> {
    const result = await query<User>(
      `INSERT INTO users (email, full_name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, created_at`,
      [data.email, data.full_name, data.password_hash],
    );
    return result.rows[0];
  },
};
