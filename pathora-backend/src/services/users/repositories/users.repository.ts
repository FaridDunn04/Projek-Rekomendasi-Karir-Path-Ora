/**
 * services/users/repositories/users.repository.ts
 *
 * PostgreSQL repository untuk domain users (DATA-001).
 * Dynamic UPDATE hanya memperbarui field yang disediakan.
 * Seluruh query menggunakan parameterized queries (SEC-006).
 */

import { query } from "../../../config/database.js";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: Date;
}

export interface UpdateUserDto {
  full_name?: string;
  email?: string;
}

// ── Repository ─────────────────────────────────────────────────────────────────

export const usersRepository = {
  /**
   * Mencari user berdasarkan ID.
   * Mengembalikan null bila tidak ditemukan.
   */
  async findById(id: string): Promise<User | null> {
    const result = await query<User>(
      `SELECT id, email, full_name, created_at
       FROM users
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  },

  /**
   * Mencari user berdasarkan email.
   * Mengembalikan null bila tidak ditemukan.
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await query<User>(
      `SELECT id, email, full_name, created_at
       FROM users
       WHERE email = $1`,
      [email],
    );
    return result.rows[0] ?? null;
  },

  /**
   * Memperbarui field yang disediakan saja (dynamic UPDATE).
   * Hanya field yang ada di `data` yang dimasukkan ke SET clause.
   * Mengembalikan user yang sudah diperbarui.
   */
  async update(id: string, data: Partial<UpdateUserDto>): Promise<User> {
    // Bangun SET clause secara dinamis dari field yang disediakan
    const fields = Object.keys(data) as (keyof UpdateUserDto)[];
    const setClauses = fields.map((field, index) => `${field} = $${index + 1}`);
    const values = fields.map((field) => data[field]);

    // Tambahkan id sebagai parameter terakhir
    values.push(id);
    const idParam = `$${values.length}`;

    const result = await query<User>(
      `UPDATE users
       SET ${setClauses.join(", ")}
       WHERE id = ${idParam}
       RETURNING id, email, full_name, created_at`,
      values,
    );

    return result.rows[0];
  },
};
