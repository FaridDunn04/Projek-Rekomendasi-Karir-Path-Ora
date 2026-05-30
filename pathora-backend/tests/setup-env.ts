/**
 * tests/setup-env.ts
 *
 * Dijalankan oleh Jest via `setupFiles` SEBELUM modul apapun di-import.
 *
 * Memuat .env.test bila ada, lalu mengeset fallback untuk env var wajib
 * agar config/index.ts lolos validasi Zod saat test berjalan.
 */

import path from "path";
import dotenv from "dotenv";

// Muat .env.test bila ada (untuk integration test dengan DB nyata)
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

// Fallback untuk unit test (bila .env.test tidak ada atau tidak lengkap)
process.env["NODE_ENV"] ??= "test";
process.env["DATABASE_URL"] ??=
  "postgresql://test:test@localhost:5432/pathora_test";
process.env["JWT_SECRET"] ??=
  "test_jwt_secret_minimal_32_karakter_untuk_testing";
process.env["JWT_EXPIRES_IN"] ??= "1h";
process.env["USE_MOCK_AI"] ??= "true";
process.env["ALLOWED_ORIGINS"] ??= "http://localhost:5173";
process.env["LOG_LEVEL"] ??= "info";
