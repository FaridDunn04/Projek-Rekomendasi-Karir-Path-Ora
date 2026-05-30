/**
 * security/password-manager.ts
 *
 * Mengelola hashing dan verifikasi password menggunakan bcrypt
 * (SEC-001, NFR-005, SDD §3.4).
 *
 * saltRounds = 12: keseimbangan keamanan vs performa
 * (~200–300 ms per hash pada hardware modern).
 */

import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export const passwordManager = {
  /**
   * Menghasilkan hash bcrypt dari password plaintext.
   * Selalu gunakan hasil hash ini untuk disimpan ke DB — tidak pernah plaintext.
   */
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  },

  /**
   * Membandingkan password plaintext dengan hash yang tersimpan.
   * Mengembalikan true bila cocok, false bila tidak.
   * Waktu perbandingan konstan (constant-time) — aman dari timing attack.
   */
  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  },
};
