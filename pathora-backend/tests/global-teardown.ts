/**
 * tests/global-teardown.ts
 *
 * Dijalankan SEKALI setelah seluruh test suite selesai.
 * Menutup pool DB agar Jest dapat exit dengan bersih.
 *
 * CATATAN: globalTeardown berjalan di konteks terpisah dari test files
 * sehingga moduleNameMapper tidak berlaku. Gunakan pg.Pool langsung
 * dengan DATABASE_URL dari process.env.
 */

import { Pool } from "pg";
import path from "path";
import dotenv from "dotenv";

export default async function globalTeardown() {
  // Muat .env.test agar DATABASE_URL tersedia
  dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) return;

  const pool = new Pool({ connectionString: databaseUrl });
  try {
    await pool.end();
  } catch {
    // Abaikan error saat menutup pool — pool mungkin sudah ditutup
  }
}
